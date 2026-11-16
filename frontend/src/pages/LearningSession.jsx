
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  BookOpen,
  Clock,
  ChevronRight,
  Loader,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://127.0.0.1:8000/api";

function getVideoUrl(url) {
  if (!url || typeof url !== "string") return "";

  const value = url.trim();

  try {
    const parsed = new URL(
      value.startsWith("//") ? `https:${value}` : value
    );

    const host = parsed.hostname
      .replace(/^www\./, "")
      .replace(/^m\./, "");

    let videoId = "";

    if (host === "youtu.be") {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] || "";
    } else if (
      host === "youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v") || "";
      } else {
        const parts = parsed.pathname.split("/").filter(Boolean);

        if (["embed", "shorts", "live", "v"].includes(parts[0])) {
          videoId = parts[1] || "";
        }
      }
    }

    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?controls=1&rel=0`;
    }
  } catch {
    // Handle uploaded Django media URLs below.
  }

  if (value.startsWith("/")) {
    return `http://127.0.0.1:8000${value}`;
  }

  return value;
}

function LearningSession() {
  const { enrollmentId } = useParams();
  const { accessToken } = useAuth();

  const [enrollment, setEnrollment] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false);

  const completedLessons = enrollment?.completed_lessons || [];

  const progress =
    enrollment?.progress_percentage ??
    (lessons.length > 0
      ? Math.round((completedLessons.length / lessons.length) * 100)
      : 0);

  useEffect(() => {
    async function loadLearningSession() {
      try {
        setLoading(true);
        setError("");

        if (!accessToken) {
          setError("Please log in to access your learning session.");
          return;
        }

        const enrollmentResponse = await fetch(
          `${API_URL}/enrollments/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!enrollmentResponse.ok) {
          throw new Error("Could not load your enrollment.");
        }

        const enrollmentData = await enrollmentResponse.json();

        const enrollmentList = Array.isArray(enrollmentData)
          ? enrollmentData
          : enrollmentData.results || [];

        const currentEnrollment = enrollmentList.find(
          (item) => Number(item.id) === Number(enrollmentId)
        );

        if (!currentEnrollment) {
          throw new Error("Enrollment not found.");
        }

        setEnrollment(currentEnrollment);

        const courseId =
          typeof currentEnrollment.course === "object"
            ? currentEnrollment.course.id
            : currentEnrollment.course;

        const lessonsResponse = await fetch(
          `${API_URL}/lessons/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!lessonsResponse.ok) {
          throw new Error("Could not load course lessons.");
        }

        const lessonsData = await lessonsResponse.json();

        const allLessons = Array.isArray(lessonsData)
          ? lessonsData
          : lessonsData.results || [];

        const courseLessons = allLessons
          .filter((lesson) => {
            const lessonCourseId =
              typeof lesson.course === "object"
                ? lesson.course.id
                : lesson.course;

            return Number(lessonCourseId) === Number(courseId);
          })
          .sort((a, b) => a.order - b.order);

        setLessons(courseLessons);

        if (courseLessons.length > 0) {
          setSelectedLesson(courseLessons[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadLearningSession();
  }, [enrollmentId, accessToken]);

  async function selectLesson(lesson) {
    setSelectedLesson(lesson);

    try {
      await fetch(`${API_URL}/lessons/${lesson.id}/start/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Could not update lesson access:", err);
    }
  }

  async function markLessonComplete() {
    if (!selectedLesson || isCompleted) return;

    try {
      setCompleting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/lessons/${selectedLesson.id}/complete/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.message ||
          "Could not complete this lesson."
        );
      }

      setEnrollment((previous) => ({
        ...previous,
        completed_lessons: [
          ...(previous.completed_lessons || []),
          selectedLesson.id,
        ],
        progress_percentage: data.progress_percentage,
        completed_at: data.completed_at,
        last_accessed_at: data.last_accessed_at,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  }

  function goToNextLesson() {
    if (!selectedLesson) return;

    const currentIndex = lessons.findIndex(
      (lesson) => lesson.id === selectedLesson.id
    );

    if (currentIndex < lessons.length - 1) {
      selectLesson(lessons[currentIndex + 1]);
    }
  }

  const isCompleted = selectedLesson
    ? completedLessons.some(
        (id) => Number(id) === Number(selectedLesson.id)
      )
    : false;

  const rawVideoUrl = selectedLesson
    ? selectedLesson.youtube_url || selectedLesson.video_file || ""
    : "";

  const videoUrl = getVideoUrl(rawVideoUrl);

  const isYouTubeVideo =
    videoUrl.includes("youtube-nocookie.com/embed/") ||
    videoUrl.includes("youtube.com/embed/");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-amber-400">
        <Loader className="animate-spin mr-3" />
        Loading your learning session...
      </div>
    );
  }

  if (error && !enrollment) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-red-400 mb-5">{error}</p>

        <Link
          to="/courses"
          className="text-amber-400 hover:text-amber-300"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-white/10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/courses"
            className="flex items-center gap-2 text-gray-400 hover:text-amber-400"
          >
            <ArrowLeft size={18} />
            Back to Courses
          </Link>

          <span className="text-amber-400 font-semibold tracking-wide">
            PATH NEXUS
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="text-amber-400 text-sm mb-2">
            YOUR LEARNING SPACE
          </p>

          <h1 className="text-2xl md:text-3xl font-bold">
            {enrollment?.course_title ||
              enrollment?.course?.title ||
              "Learning Session"}
          </h1>

          <div className="mt-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Course Progress</span>
              <span className="text-amber-400">{progress}%</span>
            </div>

            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-5">{error}</p>
        )}

        {lessons.length === 0 ? (
          <div className="bg-[#151518] border border-white/10 rounded-xl p-10 text-center">
            <BookOpen
              size={40}
              className="text-amber-400 mx-auto mb-4"
            />

            <h2 className="text-xl font-semibold mb-2">
              No lessons available yet
            </h2>

            <p className="text-gray-400">
              Your teacher has not added lessons to this course.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2">
              <div className="bg-[#151518] border border-white/10 rounded-xl overflow-hidden">
                <div className="aspect-video bg-black flex items-center justify-center">
                  {videoUrl ? (
                    isYouTubeVideo ? (
                      <iframe
                        key={videoUrl}
                        src={videoUrl}
                        title={selectedLesson?.title || "Lesson video"}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        key={videoUrl}
                        src={videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full"
                      >
                        Your browser does not support video playback.
                      </video>
                    )
                  ) : (
                    <div className="text-center text-gray-500">
                      <PlayCircle
                        size={55}
                        className="mx-auto mb-3 text-amber-400"
                      />
                      <p>No video has been added to this lesson.</p>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <p className="text-amber-400 text-sm mb-2">
                    LESSON {selectedLesson?.order}
                  </p>

                  <h2 className="text-xl font-semibold mb-3">
                    {selectedLesson?.title}
                  </h2>

                  <p className="text-gray-400 leading-7">
                    {selectedLesson?.description ||
                      "Start learning and complete this lesson to track your progress."}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={markLessonComplete}
                      disabled={completing || isCompleted}
                      className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition ${
                        isCompleted
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : "bg-amber-400 text-black hover:bg-amber-300"
                      } disabled:opacity-70`}
                    >
                      {completing ? (
                        <Loader size={18} className="animate-spin" />
                      ) : (
                        <CheckCircle size={18} />
                      )}

                      {isCompleted ? "Completed" : "Mark as Complete"}
                    </button>

                    <button
                      onClick={goToNextLesson}
                      disabled={
                        lessons.findIndex(
                          (lesson) => lesson.id === selectedLesson?.id
                        ) === lessons.length - 1
                      }
                      className="flex items-center gap-2 px-5 py-3 rounded-lg border border-white/10 text-gray-300 hover:border-amber-400 hover:text-amber-400 disabled:opacity-40"
                    >
                      Next Lesson
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <aside className="bg-[#151518] border border-white/10 rounded-xl p-5 h-fit">
              <h2 className="text-lg font-semibold mb-2">
                Course Content
              </h2>

              <p className="text-sm text-gray-500 mb-5">
                {lessons.length} lessons
              </p>

              <div className="space-y-3">
                {lessons.map((lesson) => {
                  const done = completedLessons.some(
                    (id) => Number(id) === Number(lesson.id)
                  );

                  const active =
                    selectedLesson?.id === lesson.id;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => selectLesson(lesson)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${
                        active
                          ? "bg-amber-400/10 border border-amber-400/40"
                          : "bg-white/5 border border-transparent hover:border-white/20"
                      }`}
                    >
                      {done ? (
                        <CheckCircle
                          size={19}
                          className="text-green-400 shrink-0"
                        />
                      ) : (
                        <PlayCircle
                          size={19}
                          className={`shrink-0 ${
                            active ? "text-amber-400" : "text-gray-500"
                          }`}
                        />
                      )}

                      <span className="flex-1 min-w-0">
                        <span className="block text-xs text-gray-500 mb-1">
                          Lesson {lesson.order}
                        </span>

                        <span className="block text-sm text-gray-200">
                          {lesson.title}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Clock size={16} />
                  Keep learning at your own pace.
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default LearningSession;
