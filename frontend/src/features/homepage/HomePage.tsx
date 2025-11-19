import { Link } from "react-router";
import campus1 from "../../assets/campus_1.png";
import campus2 from "../../assets/campus_2.png";
import campus3 from "../../assets/campus_3.png";

export default function HomePage() {
  return (
    <div className="min-h-screen space-y-16">
      {/* Hero Section */}
      <section className="hero min-h-[60vh] bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome to Evergreen Academy</h1>
            <p className="py-6">
              Empowering minds, building futures. Join our community of learners
              and educators.
            </p>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="w-full">
        <div className="container my-auto mx-auto flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl font-bold uppercase">Check our Campus</h1>
          <div className="carousel carousel-end rounded-box w-[90%] h-[80vh]">
            <div className="carousel-item">
              <img src={campus1} alt="Campus 1 Picture" />
            </div>
            <div className="carousel-item">
              <img src={campus2} alt="Campus 2 Picture" />
            </div>
            <div className="carousel-item">
              <img src={campus3} alt="Campus 3 Picture" />
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section>
        <div className="container mx-auto py-4">
          <h2 className="text-3xl font-bold text-center mb-8">Latest News</h2>
          <div>
            <h1 className="text-center">Dynamic News</h1>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="container mx-auto py-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Upcoming Events
          </h2>
          <div>
            <h1 className="text-center">Dynamic Events</h1>
          </div>
        </div>
      </section>

      {/* Accordion Section */}
      <section>
        <div className="container mx-auto py-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-2">
            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="my-accordion-2" defaultChecked />
              <div className="collapse-title text-xl font-medium">
                What programs do you offer?
              </div>
              <div className="collapse-content">
                <p>
                  We offer a comprehensive range of programs from kindergarten
                  to college, including STEM, arts, sports, bachelor's degrees,
                  and specialized tracks for senior high school students.
                </p>
                <Link to="/programs" className="btn btn-sm btn-outline mt-2">
                  Read More
                </Link>
              </div>
            </div>
            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="my-accordion-2" />
              <div className="collapse-title text-xl font-medium">
                How do I enroll my child?
              </div>
              <div className="collapse-content">
                <p>
                  Enrollment is easy! Visit our admissions page or contact us
                  directly to start the process.
                </p>
              </div>
            </div>
            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="my-accordion-2" />
              <div className="collapse-title text-xl font-medium">
                What are your school hours?
              </div>
              <div className="collapse-content">
                <p>
                  Our school operates from 8:00 AM to 3:00 PM, Monday through
                  Friday.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
