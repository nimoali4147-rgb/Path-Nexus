
import { useState } from 'react'

function CreateCourseForm({ onCourseCreated, onCancel }) {
  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    courseType: 'free',
    difficulty_level: 'BEGINNER',
    duration_hours: '',
    learning_objectives: '',
  })

  const [thumbnail, setThumbnail] = useState(null)
  const [contentType, setContentType] = useState('single')
  const [videoFile, setVideoFile] = useState(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const [lessons, setLessons] = useState([
    {
      title: '',
      description: '',
      video_file: null,
      youtube_url: '',
    },
  ])

  function handleChange(e) {
    const { name, value } = e.target

    setCourse((previousCourse) => ({
      ...previousCourse,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (
      !course.title.trim() ||
      !course.description.trim() ||
      !course.category ||
      !course.learning_objectives.trim()
    ) {
      alert('Please fill in all required fields.')
      return
    }

    if (course.courseType === 'paid' && Number(course.price) <= 0) {
      alert('Please enter a valid course price.')
      return
    }

    if (contentType === 'single') {
      if (!videoFile && !youtubeUrl.trim()) {
        alert('Please upload a course video or provide a YouTube URL.')
        return
      }

      if (videoFile && youtubeUrl.trim()) {
        alert('Choose either a video upload or a YouTube URL, not both.')
        return
      }
    }

    if (contentType === 'multiple') {
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i]

        if (!lesson.title.trim()) {
          alert(`Please enter a title for Lesson ${i + 1}.`)
          return
        }

        if (!lesson.video_file && !lesson.youtube_url.trim()) {
          alert(`Please provide a video for Lesson ${i + 1}.`)
          return
        }

        if (lesson.video_file && lesson.youtube_url.trim()) {
          alert(`Choose only one video option for Lesson ${i + 1}.`)
          return
        }
      }
    }

    try {
      const formData = new FormData()

      formData.append('title', course.title)
      formData.append('description', course.description)
      formData.append('category', course.category)
      formData.append(
        'price',
        course.courseType === 'free' ? '0' : String(Number(course.price))
      )
      formData.append('is_free', String(course.courseType === 'free'))
      formData.append('difficulty_level', course.difficulty_level)
      formData.append('learning_objectives', course.learning_objectives)

      if (course.duration_hours) {
        formData.append('duration_hours', course.duration_hours)
      }

      if (thumbnail) {
        formData.append('thumbnail', thumbnail)
      }

      if (contentType === 'single') {
        if (videoFile) {
          formData.append('video_file', videoFile)
        }

        if (youtubeUrl.trim()) {
          formData.append('youtube_url', youtubeUrl.trim())
        }
      }

      const response = await fetch('/api/courses/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = Object.entries(data)
          .map(([field, messages]) => {
            return `${field}: ${
              Array.isArray(messages) ? messages.join(', ') : messages
            }`
          })
          .join('\n')

        throw new Error(errorMessage || 'Failed to create course.')
      }

      if (contentType === 'multiple') {
        for (let i = 0; i < lessons.length; i++) {
          const lesson = lessons[i]
          const lessonData = new FormData()

          lessonData.append('course', String(data.id))
          lessonData.append('title', lesson.title)
          lessonData.append('description', lesson.description)
          lessonData.append('order', String(i + 1))

          if (lesson.video_file) {
            lessonData.append('video_file', lesson.video_file)
          }

          if (lesson.youtube_url.trim()) {
            lessonData.append('youtube_url', lesson.youtube_url.trim())
          }

          const lessonResponse = await fetch('/api/lessons/', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access')}`,
            },
            body: lessonData,
          })

          const lessonResult = await lessonResponse.json()

          if (!lessonResponse.ok) {
            throw new Error(
              `Course was created, but Lesson ${i + 1} failed: ${JSON.stringify(lessonResult)}`
            )
          }
        }
      }

      alert('Success! Your course and media have been saved as DRAFT.')

      onCourseCreated(data)

    } catch (error) {
      console.error(error)
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 mb-10">
      <h2 className="text-2xl font-bold mb-6">
        Create New Course
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block mb-2">Course Title</label>
          <input
            type="text"
            name="title"
            value={course.title}
            onChange={handleChange}
            placeholder="Enter course title"
            required
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">Course Description</label>
          <textarea
            name="description"
            value={course.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe your course"
            required
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">Category</label>
          <select
            name="category"
            value={course.category}
            onChange={handleChange}
            required
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
          >
            <option value="">Select category</option>
            <option value="Programming">Programming</option>
            <option value="Web Development">Web Development</option>
            <option value="Design">Design</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Course Type</label>
          <select
            name="courseType"
            value={course.courseType}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Difficulty Level</label>
          <select
            name="difficulty_level"
            value={course.difficulty_level}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Course Duration (Hours)</label>
          <input
            type="number"
            name="duration_hours"
            value={course.duration_hours}
            onChange={handleChange}
            min="1"
            placeholder="Enter duration in hours"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">Learning Objectives</label>
          <textarea
            name="learning_objectives"
            value={course.learning_objectives}
            onChange={handleChange}
            rows="4"
            placeholder="What will students learn from this course?"
            required
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">Course Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files[0])}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
          />
          <p className="text-sm text-slate-400 mt-2">
            Upload an image to represent your course.
          </p>
        </div>

        <div>
          <label className="block mb-2">Course Content Type</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
          >
            <option value="single">Single Video</option>
            <option value="multiple">Multiple Lessons</option>
          </select>
        </div>

        {contentType === 'single' && (
          <div className="space-y-4 border border-slate-700 rounded-lg p-5">
            <h3 className="font-semibold text-lg">Course Video</h3>

            <div>
              <label className="block mb-2">Upload Video</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block mb-2">OR YouTube URL</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
              />
            </div>
          </div>
        )}

        {contentType === 'multiple' && (
          <div className="border border-slate-700 rounded-lg p-5 space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Course Lessons</h3>
              <p className="text-sm text-slate-400 mt-1">
                Add videos and learning materials for each lesson.
              </p>
            </div>

            {lessons.map((lesson, index) => (
              <div
                key={index}
                className="bg-slate-950 border border-slate-700 rounded-lg p-4 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Lesson {index + 1}</h4>

                  {lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setLessons(lessons.filter((_, i) => i !== index))
                      }
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Lesson title"
                  value={lesson.title}
                  onChange={(e) =>
                    setLessons(lessons.map((item, i) =>
                      i === index ? { ...item, title: e.target.value } : item
                    ))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
                />

                <textarea
                  placeholder="Lesson description"
                  value={lesson.description}
                  onChange={(e) =>
                    setLessons(lessons.map((item, i) =>
                      i === index ? { ...item, description: e.target.value } : item
                    ))
                  }
                  rows="3"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
                />

                <div>
                  <label className="block mb-2">Upload Lesson Video</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      setLessons(lessons.map((item, i) =>
                        i === index
                          ? { ...item, video_file: e.target.files[0], youtube_url: '' }
                          : item
                      ))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block mb-2">OR YouTube URL</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={lesson.youtube_url}
                    onChange={(e) =>
                      setLessons(lessons.map((item, i) =>
                        i === index
                          ? { ...item, youtube_url: e.target.value, video_file: null }
                          : item
                      ))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setLessons([
                  ...lessons,
                  {
                    title: '',
                    description: '',
                    video_file: null,
                    youtube_url: '',
                  },
                ])
              }
              className="border border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white px-5 py-3 rounded-lg"
            >
              + Add Another Lesson
            </button>
          </div>
        )}

        {course.courseType === 'paid' && (
          <div>
            <label className="block mb-2">Course Price (KES)</label>
            <input
              type="number"
              name="price"
              value={course.price}
              onChange={handleChange}
              min="1"
              required
              placeholder="Enter course price"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
          >
            Save Course
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="border border-slate-600 hover:bg-slate-800 px-6 py-3 rounded-lg"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  )
}

export default CreateCourseForm
