import { Link } from "react-router";
import { motion } from "framer-motion";
import { Clock10Icon } from "lucide-react";
import {
  fadeInUp,
  slideInLeft,
  slideInRight,
  staggerContainer,
} from "../shared/animations";

const campus1 =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop";
const campus2 =
  "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2066&auto=format&fit=crop";
const campus3 =
  "https://images.unsplash.com/photo-1592280771190-3e2e4d50c20f?q=80&w=2070&auto=format&fit=crop";

const featuredCourses = [
  {
    title: "Information Technology",
    image: campus1,
    description:
      "Shape the digital future with our cutting-edge IT curriculum.",
  },
  {
    title: "Business Administration",
    image: campus2,
    description: "Develop leadership skills to manage global organizations.",
  },
  {
    title: "Hospitality Management",
    image: campus3,
    description: "World-class training for the service and tourism industry.",
  },
];

const newsItems = [
  {
    id: 1,
    title: "Evergreen Academy Wins National Innovation Award",
    date: "OCT 24, 2025",
    image: campus1,
    summary:
      "Our student research team took home the gold medal at the National Tech Summit...",
  },
  {
    id: 2,
    title: "New Science Wing Opening Ceremony",
    date: "OCT 20, 2025",
    image: campus2,
    summary:
      "Join us as we cut the ribbon on our state-of-the-art laboratory facilities...",
  },
];

const eventsItems = [
  {
    day: "15",
    month: "NOV",
    title: "University Foundation Week",
    time: "8:00 AM",
  },
  { day: "20", month: "NOV", title: "Career Fair 2025", time: "9:00 AM" },
  {
    day: "05",
    month: "DEC",
    title: "Christmas Lighting Ceremony",
    time: "6:00 PM",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-100 font-sans text-base-content overflow-x-hidden">
      <div
        className="hero min-h-[75vh] relative"
        style={{
          backgroundImage: `url(${campus1})`,
          backgroundAttachment: "fixed",
        }}
      >
        <div className="hero-overlay bg-black/60"></div>
        <div className="hero-content text-center text-neutral-content">
          <motion.div
            className="max-w-3xl"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1
              className="mb-5 text-5xl md:text-6xl font-bold text-white tracking-tight"
              variants={fadeInUp}
            >
              Welcome to Evergreen Academy
            </motion.h1>
            <motion.p
              className="mb-8 text-lg md:text-xl text-gray-200"
              variants={fadeInUp}
            >
              Empowering minds, building futures. Join our community of learners
              and educators dedicated to excellence, innovation, and service.
            </motion.p>
            <motion.div
              className="flex gap-4 justify-center"
              variants={fadeInUp}
            >
              <Link
                to="/admissions"
                className="btn btn-primary btn-lg border-none text-white hover:scale-105 transition-transform"
              >
                Apply Now
              </Link>
              <Link
                to="/about"
                className="btn btn-outline btn-lg text-white hover:bg-white hover:text-black hover:scale-105 transition-transform"
              >
                Virtual Tour
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <section className="py-20 bg-base-100 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Image */}
            <motion.div
              className="lg:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInLeft}
            >
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-tl-3xl -z-10"></div>
                <img
                  src={campus2}
                  alt="About Campus"
                  className="rounded-xl shadow-2xl w-full h-[400px] object-cover hover:shadow-primary/30 transition-shadow duration-300"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-secondary/20 rounded-br-3xl -z-10"></div>
              </div>
            </motion.div>

            <motion.div
              className="lg:w-1/2 space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInRight}
            >
              <div className="badge badge-secondary badge-outline font-bold p-3">
                About Us
              </div>
              <h2 className="text-4xl font-bold text-base-content leading-tight">
                A Tradition of Academic{" "}
                <span className="text-primary">Excellence</span>
              </h2>
              <p className="text-lg text-base-content/70 leading-relaxed">
                Evergreen Academy stands as a beacon of learning, providing a
                holistic education that shapes character and intellect. Our
                campus is a vibrant hub of culture, research, and community
                service, designed to prepare students for the global stage.
              </p>
              <div className="pt-2">
                <button className="btn btn-link px-0 text-primary no-underline hover:underline text-lg">
                  Read Our History →
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-base-200/50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Courses
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
            <p className="mt-4 text-base-content/60 max-w-2xl mx-auto">
              Discover programs designed to ignite your passion and prepare you
              for a successful career.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {featuredCourses.map((course, index) => (
              <motion.div
                key={index}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                <figure className="h-56 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </figure>
                <div className="card-body">
                  <h3 className="card-title text-xl text-primary">
                    {course.title}
                  </h3>
                  <p className="text-base-content/70 text-sm">
                    {course.description}
                  </p>
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-sm btn-ghost group-hover:text-primary">
                      View Details →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. NEWS & EVENTS (SPLIT LAYOUT) */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* LEFT COLUMN: LATEST NEWS */}
            <motion.div
              className="lg:w-2/3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInLeft}
            >
              <div className="flex justify-between items-center mb-8 border-b border-base-200 dark:border-white/50 pb-4">
                <h2 className="text-3xl font-bold text-base-content border-l-8 border-primary pl-4">
                  Latest News
                </h2>
                <Link
                  to="/news"
                  className="text-sm font-bold text-primary hover:underline uppercase tracking-wide"
                >
                  View Archive
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Featured News Item */}
                <motion.div
                  className="md:col-span-2 card lg:card-side bg-base-100 shadow-lg border border-base-200 dark:border-white/10 hover:border-primary/50 transition-colors"
                  whileHover={{ scale: 1.01 }}
                >
                  <figure className="lg:w-2/5 h-64 lg:h-auto">
                    <img
                      src={newsItems[0].image}
                      alt="News"
                      className="w-full h-full object-cover"
                    />
                  </figure>
                  <div className="card-body lg:w-3/5">
                    <span className="text-xs font-bold text-primary tracking-widest">
                      {newsItems[0].date}
                    </span>
                    <h3 className="card-title text-2xl mb-2 hover:text-primary cursor-pointer transition-colors">
                      {newsItems[0].title}
                    </h3>
                    <p className="text-base-content/60 line-clamp-3 mb-4">
                      {newsItems[0].summary}
                    </p>
                    <div className="card-actions">
                      <button className="btn btn-primary btn-sm btn-outline">
                        Read More
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Secondary News Items */}
                {newsItems.slice(1).map((item) => (
                  <motion.div
                    key={item.id}
                    className="card bg-base-100 shadow-md border border-base-200 dark:border-white/10 dark:hover:border-primary/50"
                    whileHover={{ y: -5 }}
                  >
                    <div className="card-body p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-ghost text-xs font-bold dark:bg-white/10">
                          {item.date}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg leading-snug hover:text-primary cursor-pointer">
                        {item.title}
                      </h3>
                      <p className="text-sm text-base-content/60 mt-2 line-clamp-2">
                        {item.summary}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT COLUMN: UPCOMING EVENTS */}
            <motion.div
              className="lg:w-1/3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInRight}
            >
              <div className="flex justify-between items-center mb-8 border-b border-base-200 dark:border-white/50 pb-4">
                <h2 className="text-3xl font-bold text-base-content border-l-8 border-secondary pl-4">
                  Events
                </h2>
                <Link
                  to="/events"
                  className="text-sm font-bold text-secondary hover:underline uppercase tracking-wide"
                >
                  Calendar
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {eventsItems.map((event, idx) => (
                  <motion.div
                    key={idx}
                    className="group flex items-center bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 dark:border-white/10 hover:shadow-md hover:border-secondary transition-all cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-secondary/10 text-secondary rounded-lg mr-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                      <span className="text-xl font-black leading-none">
                        {event.day}
                      </span>
                      <span className="text-xs font-bold uppercase">
                        {event.month}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base-content leading-tight group-hover:text-secondary transition-colors">
                        {event.title}
                      </h4>
                      <span className="text-xs text-base-content/50 mt-1 flex gap-2">
                        <Clock10Icon className="w-4 h-4" /> {event.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-8 p-6 bg-primary/5 rounded-xl text-center border border-primary/10"
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="font-bold text-primary mb-2">Have questions?</h4>
                <p className="text-sm mb-4 text-base-content/70">
                  Our admissions team is here to help you.
                </p>
                <button className="btn btn-secondary btn-sm w-full text-white">
                  Contact Admissions
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
