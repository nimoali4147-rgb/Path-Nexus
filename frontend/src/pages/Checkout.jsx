
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Smartphone, ShieldCheck, ArrowLeft } from "lucide-react";
import { apiJson } from "../service/apiService";

function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchCourse() {
      try {
        const data = await apiJson(`/api/courses/${courseId}/`);

        if (data.is_free) {
          navigate(`/courses/${courseId}`, { replace: true });
          return;
        }

        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId, navigate]);

  async function checkPaymentStatus(paymentId) {
    setChecking(true);
    setMessage(
      "Please check your phone and enter your M-Pesa PIN"
    );

    try {
      // Check payment status every 3 seconds, for up to 2 minutes.
      for (let attempt = 0; attempt < 40; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const data = await apiJson(`/api/payments/${paymentId}/status/`);

        if (data.status === "SUCCESS") {
          setMessage(
            data.receipt_number
              ? `Payment successful! Receipt: ${data.receipt_number}`
              : "Payment successful! Your course access is being prepared."
          );

          await new Promise((resolve) => setTimeout(resolve, 2000));
          navigate("/student", { replace: true });
          return;
        }

        if (data.status === "FAILED") {
          setError(
           "Payment declined. Please try again."
          );
          setMessage("");
          return;
        }
      }

      setMessage(
        "please wait for confirmation"
      );
    } catch (err) {
      setError(err.message);
      setMessage("");
    } finally {
      setChecking(false);
    }
  }


async function handlePayment(e) {
  e.preventDefault();
  setError("");
  setMessage("");

  if (!phoneNumber.trim()) {
    setError("Please enter your M-Pesa phone number.");
    return;
  }

  try {
    setPaying(true);

    const data = await apiJson("/api/payments/create/", {
      method: "POST",
      body: {
        course: Number(courseId),
        phone_number: phoneNumber.trim(),
      },
    });

    const paymentId = data.payment?.id;

    if (!paymentId) {
      throw new Error(
        "Payment request was accepted, but no payment ID was returned."
      );
    }

    setPaying(false);
    await checkPaymentStatus(paymentId);

  } catch (err) {
    setError(err.message);
  } finally {
    setPaying(false);
  }
}

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 p-10 text-center text-white">
        Please log in to continue.
        <button
          onClick={() => navigate("/login")}
          className="ml-2 text-amber-400"
        >
          Login
        </button>
      </div>
    );
  }

  if (user?.role !== "student") {
    return (
      <div className="min-h-screen bg-neutral-950 p-10 text-center text-white">
        Only students can make payments.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 p-10 text-center text-white">
        Loading checkout...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-neutral-950 p-10 text-center text-red-400">
        {error || "Course not found."}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-12 text-stone-100">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate("/courses")}
          disabled={paying || checking}
          className="mb-8 flex items-center gap-2 text-stone-400 hover:text-amber-400 disabled:opacity-50"
        >
          <ArrowLeft size={18} />
          Back to Courses
        </button>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:p-8">
          <div className="mb-7 text-center">
            <Smartphone
              size={42}
              className="mx-auto mb-4 text-amber-400"
            />

            <h1 className="text-3xl font-bold">
              Complete Your Payment
            </h1>

            <p className="mt-2 text-stone-400">
              Secure your access to this course.
            </p>
          </div>

          <div className="mb-7 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="mb-4 h-44 w-full rounded-lg object-cover"
              />
            )}

            <h2 className="text-xl font-bold">{course.title}</h2>

            <p className="mt-2 text-sm text-stone-400">
              {course.description}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-neutral-800 pt-4">
              <span className="text-stone-400">Total Amount</span>

              <span className="text-2xl font-bold text-amber-400">
                KES {Number(course.price).toLocaleString("en-KE")}
              </span>
            </div>
          </div>

          <form onSubmit={handlePayment}>
            <label className="mb-2 block font-semibold">
              M-Pesa Phone Number
            </label>

            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="2547XXXXXXXX"
              disabled={paying || checking}
              className="mb-5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-4 text-white outline-none focus:border-amber-400 disabled:opacity-60"
              required
            />

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
                {checking && (
                  <span className="mr-2 inline-block animate-spin">⏳</span>
                )}
                {message}
              </div>
            )}

            <button
                type="submit"
                disabled={paying || checking}
                className="w-full rounded-xl bg-amber-400 py-4 font-bold text-neutral-950 transition hover:bg-amber-500 disabled:opacity-60"
                >
                {checking
                    ? "Checking Payment..."
                    : paying
                    ? "Sending STK Push..."
                    : "Pay Now with M-Pesa"}
                </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-stone-500">
            <ShieldCheck size={18} className="text-green-400" />
            Secure payment through M-Pesa
          </div>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
