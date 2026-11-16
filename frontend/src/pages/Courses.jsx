
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  BookOpen,
  Clock3,
  BarChart3,
  GraduationCap,
  Sparkles,
  BookMarked,
  ArrowRight,
  PlayCircle,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000/api";

async function getResponseData(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.message ||
      data.error ||
      "Something went wrong."
    );
  }

  return data;
}

function Courses() {
  const navigate = useNavigate();
  const { user, isAuthenticated, accessToken } = useAuth();

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/courses/`);
        const data = await getResponseData(response);

        setCourses(
          Array.isArray(data) ? data : data.results || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  useEffect(() => {
    async function fetchEnrollments() {
      if (!isAuthenticated || user?.role !== "student" || !accessToken) {
        setEnrollments([]);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/enrollments/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await getResponseData(response);

        setEnrollments(
          Array.isArray(data) ? data : data.results || []
        );
      } catch (err) {
        setError(err.message);
      }
    }

    fetchEnrollments();
  }, [isAuthenticated, user?.role, accessToken]);

  const filteredCourses = courses.filter((course) =>
    `${course.title || ""} ${course.description || ""} ${course.category || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function handleEnroll(course) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "student") {
      navigate(`/courses/${course.id}`);
      return;
    }

    const existingEnrollment = enrollments.find((item) => {
      const courseId =
        typeof item.course === "object"
          ? item.course?.id
          : item.course;

      return Number(courseId) === Number(course.id);
    });

    if (existingEnrollment) {
      navigate(`/learning/${existingEnrollment.id}`);
      return;
    }

    if (!course.is_free) {
      navigate(`/checkout/${course.id}`);
      return;
    }

    try {
      setBusyId(course.id);
      setError("");

      const response = await fetch(`${API_URL}/enrollments/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course: course.id,
        }),
      });

      const enrollment = await getResponseData(response);

      setEnrollments((previous) => [
        ...previous,
        enrollment,
      ]);

      navigate(`/learning/${enrollment.id}`);
    } catch (err) {
      setError(err.message);

      try {
        const response = await fetch(`${API_URL}/enrollments/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await getResponseData(response);

        const list = Array.isArray(data)
          ? data
          : data.results || [];

        setEnrollments(list);

        const existing = list.find((item) => {
          const courseId =
            typeof item.course === "object"
              ? item.course?.id
              : item.course;

          return Number(courseId) === Number(course.id);
        });

        if (existing) {
          setError("");
          navigate(`/learning/${existing.id}`);
        }
      } catch {
        // Keep the original error visible.
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-12 text-stone-100 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-amber-400">
            <Sparkles size={16} />
            <span className="text-xs font-semibold tracking-wider">
              LEARN SOMETHING NEW
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Explore Our{" "}
            <span className="text-amber-400">Courses</span>
          </h1>

          <p className="mx-auto max-w-2xl text-stone-400">
            Discover courses created by experienced teachers and build
            the skills you need for your future.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-12 max-w-xl">
          <div className="relative">
            <Search
              size={21}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a course..."
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-4 pl-14 pr-5 text-stone-100 outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center text-stone-400">
            Loading courses...
          </div>
        )}

        {/* No courses */}
        {!loading && filteredCourses.length === 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-12 text-center">
            <BookOpen
              size={40}
              className="mx-auto mb-5 text-amber-400"
            />

            <h2 className="mb-3 text-2xl font-bold">
              {search ? "No Courses Found" : "Courses Coming Soon"}
            </h2>

            <p className="text-stone-400">
              {search
                ? "Try another search keyword."
                : "Published courses will appear here."}
            </p>
          </div>
        )}

        {/* Courses */}
        {!loading && filteredCourses.length > 0 && (
          <>
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Available Courses
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Explore and discover your next skill.
                </p>
              </div>

              <div className="flex items-center gap-2 text-amber-400">
                <BookMarked size={18} />
                {filteredCourses.length} Courses
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => {
                const enrollment = enrollments.find((item) => {
                  const courseId =
                    typeof item.course === "object"
                      ? item.course?.id
                      : item.course;

                  return Number(courseId) === Number(course.id);
                });

                return (
                  <div
                    key={course.id}
                    className="flex flex-col self-start rounded-2xl border border-neutral-800 bg-neutral-900 p-4 transition hover:-translate-y-1 hover:border-amber-400/50"
                  >
                    {/* Card Header */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                        <GraduationCap size={25} />
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                          course.is_free
                            ? "border-green-500/20 bg-green-500/10 text-green-400"
                            : "border-amber-400/20 bg-amber-400/10 text-amber-400"
                        }`}
                      >
                        {course.is_free ? "Free Course" : "Paid Course"}
                      </span>
                    </div>

                    {/* Course Image */}
                    {course.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="mb-3 h-46 w-full rounded-xl object-cover"
                      />
                    )}

                    {/* Course Information */}
                    <p className="mb-2 text-sm font-semibold text-amber-400">
                      {course.category}
                    </p>

                    <h2 className="mb-2 text-lg font-bold leading-snug">
                      {course.title}
                    </h2>

                    <p className="mb-3 line-clamp-2 text-sm leading-5 text-stone-400">
                      {course.description}
                    </p>

                    {/* Course Details */}
                    <div className="space-y-2 border-t border-neutral-800 pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-stone-400">
                          <BarChart3 size={17} />
                          Level
                        </span>

                        <span>
                          {course.difficulty_level || "Not specified"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-stone-400">
                          <Clock3 size={17} />
                          Duration
                        </span>

                        <span>
                          {course.duration_hours
                            ? `${course.duration_hours} hours`
                            : "Not specified"}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-3 flex items-center justify-between border-t border-neutral-800 pt-3">
                      <span className="text-sm text-stone-400">
                        Course Price
                      </span>

                      <span className="text-lg font-bold text-amber-400">
                        {course.is_free
                          ? "Free"
                          : `KES ${Number(
                              course.price || 0
                            ).toLocaleString("en-KE")}`}
                      </span>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
                      <Link
                        to={`/courses/${course.id}`}
                        className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/40 px-3 py-3 text-sm font-bold text-amber-400 transition hover:bg-amber-400/10"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleEnroll(course)}
                        disabled={busyId === course.id}
                        className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-500 disabled:opacity-60"
                      >
                        {enrollment ? (
                          <>
                            <PlayCircle size={17} />
                            Continue
                          </>
                        ) : busyId === course.id ? (
                          "Please wait..."
                        ) : course.is_free ? (
                          "Enroll Free"
                        ) : (
                          <>
                            Enroll / Pay
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Courses;
