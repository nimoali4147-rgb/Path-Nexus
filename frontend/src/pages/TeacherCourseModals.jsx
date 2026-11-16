
import { useState } from 'react'
import {
  X,
  Save,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Video,
  Loader,
} from 'lucide-react'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

function TeacherCourseModals({
  selectedCourse,
  setSelectedCourse,
  editingCourse,
  setEditingCourse,
  handleUpdateCourse,
  savingCourse,
}) {
  // LESSON MANAGEMENT STATE
  const [managingCourse, setManagingCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [savingLesson, setSavingLesson] = useState(false)
  const [lessonError, setLessonError] = useState('')
  const [editingLesson, setEditingLesson] = useState(null)
  const [pendingLessons, setPendingLessons] = useState([])
  const [savingAllLessons, setSavingAllLessons] = useState(false)



  const emptyLesson = {
    title: '',
    description: '',
    youtube_url: '',
    video_file: null,
    order: 1,
  }

  const [lessonForm, setLessonForm] = useState(emptyLesson)

  const getToken = () => localStorage.getItem('access')

  // LOAD COURSE LESSONS
  async function loadLessons(courseId) {
    try {
      setLoadingLessons(true)
      setLessonError('')

      const response = await fetch(`${API_URL}/lessons/`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Could not load course lessons.'
        )
      }

      const allLessons = Array.isArray(data)
        ? data
        : data.results || []

      const courseLessons = allLessons
        .filter(
          (lesson) =>
            Number(lesson.course) === Number(courseId)
        )
        .sort((a, b) => a.order - b.order)

      setLessons(courseLessons)
    } catch (error) {
      setLessonError(error.message)
    } finally {
      setLoadingLessons(false)
    }
  }

  // OPEN LESSON MANAGEMENT
  function openLessonManagement(course) {
    setManagingCourse(course)
    setSelectedCourse(null)
    setEditingLesson(null)
    setLessonForm({ ...emptyLesson, order: 1 })
    setPendingLessons([])
    setLessonError('')
    setLessons([])
    loadLessons(course.id)
  }

  // SAVE NEW OR UPDATED LESSON
  async function handleSaveLesson(e) {
    e.preventDefault()

    if (!managingCourse) return

    const youtubeUrl = lessonForm.youtube_url.trim()

    if (!lessonForm.title.trim()) {
      setLessonError('Please enter a lesson title.')
      return
    }

    if (!youtubeUrl && !lessonForm.video_file && !editingLesson?.video_file) {
      setLessonError('Please provide a YouTube URL or upload a video.')
      return
    }

    if (youtubeUrl && lessonForm.video_file) {
      setLessonError('Choose either a YouTube URL or a video upload, not both.')
      return
    }

    const token = getToken()
    if (!token) {
      setLessonError('Your session has expired. Please sign in again.')
      return
    }

    try {
      setSavingLesson(true)
      setLessonError('')

      const formData = new FormData()
      formData.append('course', String(managingCourse.id))
      formData.append('title', lessonForm.title.trim())
      formData.append('description', lessonForm.description || '')
      formData.append('order', String(lessonForm.order || 1))

      if (youtubeUrl) {
        formData.append('youtube_url', youtubeUrl)
      } else if (lessonForm.video_file) {
        formData.append('video_file', lessonForm.video_file)
        // Clear a previous YouTube URL when replacing it with an uploaded video.
        formData.append('youtube_url', '')
      }
      // When editing an existing uploaded video without replacing it,
      // omit video_file and youtube_url so Django keeps the existing file.

      const url = editingLesson
        ? `${API_URL}/lessons/${editingLesson.id}/`
        : `${API_URL}/lessons/`

      const response = await fetch(url, {
        method: editingLesson ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = response.status === 204
        ? null
        : await response.json().catch(() => ({}))

      if (!response.ok) {
        const detail = data?.detail || Object.entries(data || {})
          .map(([key, value]) =>
            `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`
          )
          .join(' | ')

        throw new Error(detail || `Could not ${editingLesson ? 'update' : 'save'} lesson.`)
      }

      // Refresh from the database so the curriculum shows persisted lessons.
      await loadLessons(managingCourse.id)
      setLessonForm({ ...emptyLesson, order: Number(lessonForm.order || 1) + 1 })
      setEditingLesson(null)
    } catch (error) {
      setLessonError(error.message || 'Could not save lesson.')
    } finally {
      setSavingLesson(false)
    }
  }


  // ADD A NEW LESSON TO THE TEMPORARY QUEUE (NO DATABASE REQUEST YET)
  function handleAddLesson(e) {
    e.preventDefault()

    if (!managingCourse) return

    const youtubeUrl = lessonForm.youtube_url.trim()

    if (!lessonForm.title.trim()) {
      setLessonError('Please enter a lesson title.')
      return
    }

    if (!youtubeUrl && !lessonForm.video_file) {
      setLessonError('Please provide a YouTube URL or upload a video.')
      return
    }

    if (youtubeUrl && lessonForm.video_file) {
      setLessonError('Choose either a YouTube URL or a video upload, not both.')
      return
    }

    const nextOrder = Number(lessonForm.order) || pendingLessons.length + 1

    setPendingLessons((previous) => [
      ...previous,
      {
        ...lessonForm,
        title: lessonForm.title.trim(),
        description: lessonForm.description || '',
        youtube_url: youtubeUrl,
        order: nextOrder,
      },
    ])

    setLessonForm({
      ...emptyLesson,
      order: nextOrder + 1,
    })
    setLessonError('')
  }

  // SAVE QUEUED LESSONS TO DJANGO / POSTGRESQL
  async function handleSavePendingLessons() {
    if (!managingCourse || pendingLessons.length === 0 || savingAllLessons) return

    const token = getToken()

    if (!token) {
      setLessonError('Your session has expired. Please sign in again.')
      return
    }

    let savedCount = 0
    const lessonsToSave = [...pendingLessons]

    try {
      setSavingAllLessons(true)
      setLessonError('')

      for (const lesson of lessonsToSave) {
        const formData = new FormData()
        formData.append('course', String(managingCourse.id))
        formData.append('title', lesson.title)
        formData.append('description', lesson.description || '')
        formData.append('order', String(lesson.order))

        if (lesson.youtube_url) {
          formData.append('youtube_url', lesson.youtube_url)
        } else if (lesson.video_file) {
          formData.append('video_file', lesson.video_file)
        }

        const response = await fetch(`${API_URL}/lessons/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          const detail = data?.detail || Object.entries(data || {})
            .map(([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`
            )
            .join(' | ')

          throw new Error(detail || `Could not save "${lesson.title}".`)
        }

        savedCount += 1
      }

      setPendingLessons([])
      setLessonForm({ ...emptyLesson, order: lessons.length + lessonsToSave.length + 1 })
      await loadLessons(managingCourse.id)
      setLessonError('')
      window.alert(`${savedCount} lesson(s) saved successfully.`)
    } catch (error) {
      // Keep only lessons that were not saved, avoiding duplicate submissions
      // when the teacher retries after a partial success.
      setPendingLessons(lessonsToSave.slice(savedCount))
      await loadLessons(managingCourse.id)
      setLessonError(
        `${savedCount} lesson(s) saved. ${error.message || 'Could not save the remaining lessons.'}`
      )
    } finally {
      setSavingAllLessons(false)
    }
  }

  // EDIT LESSON
  function startEditingLesson(lesson) {
    setEditingLesson(lesson)

    setLessonForm({
      title: lesson.title || '',
      description: lesson.description || '',
      youtube_url: lesson.youtube_url || '',
      video_file: null,
      order: lesson.order || 1,
    })

    setLessonError('')
  }

  // DELETE LESSON
  async function handleDeleteLesson(lesson) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${lesson.title}"?`
    )

    if (!confirmed) return

    try {
      setLessonError('')

      const response = await fetch(
        `${API_URL}/lessons/${lesson.id}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.detail || 'Could not delete this lesson.'
        )
      }

      if (editingLesson?.id === lesson.id) {
        setEditingLesson(null)
        setLessonForm(emptyLesson)
      }

      await loadLessons(managingCourse.id)
    } catch (error) {
      setLessonError(error.message)
    }
  }

  return (
    <>
      {/* VIEW COURSE DETAILS */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Course Details
              </h2>

              <button
                onClick={() => setSelectedCourse(null)}
                className="text-stone-400 hover:text-white"
              >
                <X size={23} />
              </button>
            </div>

            <h3 className="text-2xl font-bold text-amber-400">
              {selectedCourse.title}
            </h3>

            <p className="mt-3 text-stone-300">
              {selectedCourse.description}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-neutral-950 p-4">
                <p className="text-xs text-stone-500">
                  Category
                </p>
                <p className="mt-1">
                  {selectedCourse.category}
                </p>
              </div>

              <div className="rounded-xl bg-neutral-950 p-4">
                <p className="text-xs text-stone-500">
                  Status
                </p>
                <p className="mt-1">
                  {selectedCourse.status}
                </p>
              </div>

              <div className="rounded-xl bg-neutral-950 p-4">
                <p className="text-xs text-stone-500">
                  Difficulty
                </p>
                <p className="mt-1">
                  {selectedCourse.difficulty_level || 'Not specified'}
                </p>
              </div>

              <div className="rounded-xl bg-neutral-950 p-4">
                <p className="text-xs text-stone-500">
                  Price
                </p>
                <p className="mt-1">
                  {selectedCourse.is_free
                    ? 'Free'
                    : `KES ${selectedCourse.price}`}
                </p>
              </div>
            </div>

            {selectedCourse.learning_objectives && (
              <div className="mt-5 rounded-xl bg-neutral-950 p-4">
                <p className="text-xs text-stone-500">
                  Learning Objectives
                </p>
                <p className="mt-2 whitespace-pre-line text-sm">
                  {selectedCourse.learning_objectives}
                </p>
              </div>
            )}

            {selectedCourse.rejection_reason && (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="font-semibold text-red-400">
                  Admin Feedback
                </p>
                <p className="mt-2 text-sm">
                  {selectedCourse.rejection_reason}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() =>
                  openLessonManagement(selectedCourse)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 font-bold text-neutral-950 hover:bg-amber-500"
              >
                <BookOpen size={18} />
                Manage Lessons
              </button>

              <button
                onClick={() => setSelectedCourse(null)}
                className="rounded-xl border border-neutral-700 px-6 py-3 text-stone-300 hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COURSE */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <form
            onSubmit={handleUpdateCourse}
            className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-neutral-700 bg-neutral-900 p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Edit Course
              </h2>

              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="text-stone-400 hover:text-white"
              >
                <X size={23} />
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Course Title
              </label>

              <input
                required
                value={editingCourse.title}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    title: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Description
              </label>

              <textarea
                required
                rows="4"
                value={editingCourse.description}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Category
              </label>

              <input
                required
                value={editingCourse.category}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    category: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Course Thumbnail
              </label>

              {editingCourse.currentThumbnail && (
                <img
                  src={editingCourse.currentThumbnail}
                  alt="Current course thumbnail"
                  className="mb-3 h-36 w-full rounded-xl object-cover"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    thumbnail: e.target.files?.[0] || null,
                  })
                }
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-white"
              />

              <p className="mt-2 text-xs text-stone-500">
                Choose a new image only if you want to replace the current thumbnail.
              </p>
            </div>

            <div className="space-y-4 rounded-xl border border-neutral-700 p-4">
              <h3 className="font-semibold text-amber-400">
                Course Video
              </h3>

              {editingCourse.currentVideo && (
                <p className="break-all text-xs text-stone-500">
                  Current uploaded video: {editingCourse.currentVideo}
                </p>
              )}

              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  Upload a replacement video
                </label>

                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      video_file: e.target.files?.[0] || null,
                      youtube_url: e.target.files?.[0]
                        ? ''
                        : editingCourse.youtube_url,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  OR YouTube URL
                </label>

                <input
                  type="url"
                  value={editingCourse.youtube_url}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      youtube_url: e.target.value,
                      video_file: null,
                    })
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-white outline-none focus:border-amber-400"
                />
              </div>

              <p className="text-xs text-stone-500">
                Leave both fields unchanged to keep the existing course video.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Difficulty Level
              </label>

              <select
                value={editingCourse.difficulty_level}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    difficulty_level: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-white outline-none focus:border-amber-400"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Duration (hours)
              </label>

              <input
                type="number"
                min="1"
                value={editingCourse.duration_hours}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    duration_hours: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-400">
                Learning Objectives
              </label>

              <textarea
                rows="3"
                value={editingCourse.learning_objectives}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    learning_objectives: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-white outline-none focus:border-amber-400"
              />
            </div>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={editingCourse.is_free}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    is_free: e.target.checked,
                    price: e.target.checked ? 0 : editingCourse.price,
                  })
                }
                className="h-4 w-4 accent-amber-400"
              />
              This is a free course
            </label>

            {!editingCourse.is_free && (
              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  Course Price (KES)
                </label>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={editingCourse.price}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      price: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-white outline-none focus:border-amber-400"
                />
              </div>
            )}

            <div className="flex flex-col gap-3 pt-3 sm:flex-row">
              <button
                type="submit"
                disabled={savingCourse}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 font-bold text-neutral-950 hover:bg-amber-500 disabled:opacity-50"
              >
                <Save size={18} />
                {savingCourse ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="rounded-xl border border-neutral-700 px-6 py-3 text-stone-300 hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LESSON MANAGEMENT */}
      {managingCourse && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-amber-400">
                  Manage Lessons
                </h2>

                <p className="mt-1 text-sm text-stone-400">
                  {managingCourse.title}
                </p>
              </div>

              <button
                onClick={() => {
                  setManagingCourse(null)
                  setEditingLesson(null)
                  setLessonForm(emptyLesson)
                  setPendingLessons([])
                  setLessonError('')
                }}
                className="text-stone-400 hover:text-white"
              >
                <X size={23} />
              </button>
            </div>

            {lessonError && (
              <div className="mb-4 break-words rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {lessonError}
              </div>
            )}

            {/* ADD / EDIT LESSON FORM */}
            <form
              onSubmit={editingLesson ? handleSaveLesson : handleAddLesson}
              className="space-y-4 rounded-xl border border-neutral-700 bg-neutral-950 p-4"
            >
              <h3 className="font-semibold text-white">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h3>

              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  Lesson Title
                </label>

                <input
                  required
                  value={lessonForm.title}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Introduction to Python"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  Description
                </label>

                <textarea
                  rows="3"
                  value={lessonForm.description}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="What will students learn in this lesson?"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  Lesson Order
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={lessonForm.order}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      order: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  YouTube URL
                </label>

                <input
                  type="url"
                  value={lessonForm.youtube_url}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      youtube_url: e.target.value,
                      video_file: null,
                    })
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="text-center text-xs text-stone-500">
                OR UPLOAD A VIDEO
              </div>

              <div>
                <label className="mb-2 block text-sm text-stone-400">
                  Video File
                </label>

                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      video_file: e.target.files?.[0] || null,
                      youtube_url: e.target.files?.[0]
                        ? ''
                        : lessonForm.youtube_url,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-white"
                />

                {editingLesson?.video_file && !lessonForm.video_file && (
                  <p className="mt-2 break-all text-xs text-stone-500">
                    Existing video will be kept unless you choose a replacement.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={savingLesson || savingAllLessons}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 font-bold text-neutral-950 hover:bg-amber-500 disabled:opacity-50"
                >
                  {savingLesson ? (
                    <Loader size={18} className="animate-spin" />
                  ) : editingLesson ? (
                    <Save size={18} />
                  ) : (
                    <Plus size={18} />
                  )}

                  {savingLesson
                    ? 'Saving...'
                    : editingLesson
                      ? 'Update Lesson'
                      : 'Add Lesson'}
                </button>

                {editingLesson && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLesson(null)
                      setLessonForm(emptyLesson)
                      setLessonError('')
                    }}
                    className="rounded-xl border border-neutral-700 px-5 py-3 text-stone-300 hover:bg-neutral-800"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            {/* LESSONS WAITING TO BE SAVED */}
            {pendingLessons.length > 0 && !editingLesson && (
              <div className="mt-5 rounded-xl border border-amber-400/30 bg-neutral-950 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-amber-400">
                    Lessons Ready to Save
                  </h3>
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">
                    {pendingLessons.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {pendingLessons.map((lesson, index) => (
                    <div
                      key={`${lesson.order}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg bg-neutral-900 p-3"
                    >
                      <div className="min-w-0">
                        <p className="break-words font-medium text-white">
                          {lesson.order}. {lesson.title}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {lesson.youtube_url ? 'YouTube video' : 'Uploaded video'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setPendingLessons((previous) =>
                            previous.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                        disabled={savingAllLessons}
                        className="shrink-0 rounded-lg border border-red-500/30 p-2 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                        title="Remove pending lesson"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSavePendingLessons}
                  disabled={savingAllLessons || pendingLessons.length === 0}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 font-bold text-neutral-950 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingAllLessons ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {savingAllLessons ? 'Saving Lessons...' : 'Save All Lessons'}
                </button>
              </div>
            )}

            {/* COURSE CURRICULUM */}
            <div className="mt-7">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">
                  Course Curriculum
                </h3>

                <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">
                  {lessons.length} Lessons
                </span>
              </div>

              {loadingLessons ? (
                <div className="flex items-center justify-center gap-2 py-8 text-stone-400">
                  <Loader size={18} className="animate-spin" />
                  Loading lessons...
                </div>
              ) : lessons.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-700 p-8 text-center">
                  <BookOpen
                    size={35}
                    className="mx-auto mb-3 text-amber-400"
                  />

                  <p className="font-semibold text-white">
                    No lessons added yet
                  </p>

                  <p className="mt-2 text-sm text-stone-400">
                    Add your first lesson using the form above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-700 bg-neutral-950 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                          <Video size={20} />
                        </div>

                        <div className="min-w-0">
                          <p className="break-words font-semibold text-white">
                            {lesson.order}. {lesson.title}
                          </p>

                          <p className="mt-1 text-xs text-stone-500">
                            {lesson.youtube_url
                              ? 'YouTube video'
                              : lesson.video_file
                                ? 'Uploaded video'
                                : 'Video not available'}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            startEditingLesson(lesson)
                          }
                          className="rounded-lg border border-neutral-700 p-2 text-amber-400 hover:bg-neutral-800"
                          title="Edit lesson"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteLesson(lesson)
                          }
                          className="rounded-lg border border-red-500/30 p-2 text-red-400 hover:bg-red-500/10"
                          title="Delete lesson"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TeacherCourseModals
