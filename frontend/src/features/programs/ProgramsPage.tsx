import { Link } from "react-router";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "../../shared/animations";

export default function ProgramsPage() {
  return (
    <div className="min-h-screen py-6">
      <div className="container mx-auto px-4">
        {/* Header Section - Animates on Load */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold mb-4"
          >
            Our Programs
          </motion.h1>
          <motion.p variants={itemVariants} className="text-base-content/50">
            Comprehensive educational offerings from K-12 to college
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link to="/" className="btn btn-primary mt-4">
              Back to Home
            </Link>
          </motion.div>
        </motion.div>

        {/* Senior High School Tracks */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              Senior High School Tracks
            </h2>
            <p className="mb-6 text-center text-base-content/50">
              The K–12 Senior High School program in the Philippines (Grades
              11–12) is organized into four main tracks, each with specific
              strands and specializations.
            </p>
          </motion.div>

          {/* Staggered Grid Animation */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <motion.div
              variants={itemVariants}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body">
                <h3 className="card-title">Academic Track</h3>
                <p>For students planning to go to college with strands:</p>
                <ul className="list-disc list-inside">
                  <li>
                    STEM (Science, Technology, Engineering and Mathematics)
                  </li>
                  <li>ABM (Accountancy, Business and Management)</li>
                  <li>HUMSS (Humanities and Social Sciences)</li>
                  <li>GAS (General Academic Strand)</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body">
                <h3 className="card-title">
                  Technical-Vocational-Livelihood (TVL) Track
                </h3>
                <p>With strands aligned with TESDA qualifications:</p>
                <ul className="list-disc list-inside">
                  <li>Agri-Fishery Arts</li>
                  <li>Home Economics</li>
                  <li>Industrial Arts</li>
                  <li>ICT (Information and Communications Technology)</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body">
                <h3 className="card-title">Arts and Design Track</h3>
                <p>Focusing on creative industries:</p>
                <ul className="list-disc list-inside">
                  <li>Performing arts</li>
                  <li>Visual arts</li>
                  <li>Media arts</li>
                  <li>Creative industries subjects</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body">
                <h3 className="card-title">Sports Track</h3>
                <p>For learners interested in sports and recreation:</p>
                <ul className="list-disc list-inside">
                  <li>Physical fitness</li>
                  <li>Safety training</li>
                  <li>Sports science foundations</li>
                  <li>Coaching and recreation careers</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Examples of Subjects */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              Examples of Subjects per SHS Track
            </h2>
            <p className="mb-6 text-center text-base-content/50">
              Each SHS student takes 15 core subjects plus applied and
              specialized subjects depending on track and strand.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <motion.div
              variants={itemVariants}
              className="collapse collapse-arrow bg-base-200"
            >
              <input type="radio" name="subjects" defaultChecked />
              <div className="collapse-title text-xl font-medium">
                STEM Specialized Subjects
              </div>
              <div className="collapse-content">
                <ul className="list-disc list-inside">
                  <li>Pre-Calculus</li>
                  <li>Basic Calculus</li>
                  <li>General Biology 1-2</li>
                  <li>General Physics 1-2</li>
                  <li>General Chemistry 1-2</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="collapse collapse-arrow bg-base-200"
            >
              <input type="radio" name="subjects" />
              <div className="collapse-title text-xl font-medium">
                GAS Subjects
              </div>
              <div className="collapse-content">
                <ul className="list-disc list-inside">
                  <li>Humanities 1-2</li>
                  <li>Social Science 1</li>
                  <li>Applied Economics</li>
                  <li>Organization and Management</li>
                  <li>Disaster Readiness and Risk Reduction</li>
                  <li>Electives from any track</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="collapse collapse-arrow bg-base-200"
            >
              <input type="radio" name="subjects" />
              <div className="collapse-title text-xl font-medium">
                Arts and Design Subjects
              </div>
              <div className="collapse-content">
                <ul className="list-disc list-inside">
                  <li>Creative Industries I & II</li>
                  <li>Physical and Personal Development in the Arts</li>
                  <li>Leadership and Management in Different Arts Fields</li>
                  <li>Performing Arts Production</li>
                  <li>Exhibit for Arts Production</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="collapse collapse-arrow bg-base-200"
            >
              <input type="radio" name="subjects" />
              <div className="collapse-title text-xl font-medium">
                TVL Subjects
              </div>
              <div className="collapse-content">
                <p>
                  By strand: Agri-Fishery Arts, Home Economics, Industrial Arts,
                  ICT, each having TESDA-aligned specializations and work
                  immersion.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Bachelor's Degrees */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              Common Bachelor's Degree Fields
            </h2>
            <p className="mb-6 text-center text-base-content/50">
              Universities and colleges offer many 4- to 5-year undergraduate
              (bachelor's) programs across disciplines, regulated by CHED.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <motion.div
              variants={itemVariants}
              className="collapse collapse-arrow bg-base-200"
            >
              <input type="radio" name="degrees" defaultChecked />
              <div className="collapse-title text-xl font-medium">
                Arts and Humanities
              </div>
              <div className="collapse-content">
                <ul className="list-disc list-inside columns-2">
                  <li>AB History</li>
                  <li>AB Philosophy</li>
                  <li>AB English</li>
                  <li>AB Communication</li>
                  <li>AB Political Science</li>
                  <li>Bachelor of Fine Arts</li>
                  <li>AB Filipino</li>
                  <li>AB Journalism</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="collapse collapse-arrow bg-base-200"
            >
              <input type="radio" name="degrees" />
              <div className="collapse-title text-xl font-medium">
                Social Sciences and Education
              </div>
              <div className="collapse-content">
                <ul className="list-disc list-inside columns-2">
                  <li>BS Psychology</li>
                  <li>BS Social Work</li>
                  <li>Bachelor of Secondary Education (various majors)</li>
                  <li>Bachelor of Elementary Education</li>
                  <li>Bachelor of Early Childhood Education</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="collapse collapse-arrow bg-base-200"
            >
              <input type="radio" name="degrees" />
              <div className="collapse-title text-xl font-medium">
                Business and Management
              </div>
              <div className="collapse-content">
                <ul className="list-disc list-inside columns-2">
                  <li>BS Accountancy</li>
                  <li>BS Business Administration (various majors)</li>
                  <li>BS Management Accounting</li>
                  <li>BS Entrepreneurship</li>
                  <li>BS Real Estate Management</li>
                  <li>BS Customs Administration</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="collapse collapse-arrow bg-base-200"
            >
              <input type="radio" name="degrees" />
              <div className="collapse-title text-xl font-medium">
                Information and Computing
              </div>
              <div className="collapse-content">
                <ul className="list-disc list-inside">
                  <li>BS Computer Science</li>
                  <li>BS Information Technology</li>
                  <li>BS Information Systems</li>
                  <li>BS Entertainment and Multimedia Computing</li>
                  <li>BS Computer Engineering</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="collapse collapse-arrow bg-base-200"
            >
              <input type="radio" name="degrees" />
              <div className="collapse-title text-xl font-medium">
                Engineering and Technology
              </div>
              <div className="collapse-content">
                <ul className="list-disc list-inside columns-2">
                  <li>BS Civil Engineering</li>
                  <li>BS Mechanical Engineering</li>
                  <li>BS Electrical Engineering</li>
                  <li>BS Electronics Engineering</li>
                  <li>BS Computer Engineering</li>
                  <li>BS Chemical Engineering</li>
                  <li>BS Industrial Engineering</li>
                  <li>BS Geodetic Engineering</li>
                  <li>BS Mining Engineering</li>
                  <li>BS Metallurgical Engineering</li>
                  <li>BS Sanitary Engineering</li>
                  <li>BS Aeronautical Engineering</li>
                  <li>BS Petroleum Engineering</li>
                  <li>BS Marine Engineering</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="collapse collapse-arrow bg-base-200"
            >
              <input type="radio" name="degrees" />
              <div className="collapse-title text-xl font-medium">
                Health-Related Programs
              </div>
              <div className="collapse-content">
                <ul className="list-disc list-inside columns-2">
                  <li>BS Nursing</li>
                  <li>BS Pharmacy</li>
                  <li>BS Medical Technology</li>
                  <li>BS Radiologic Technology</li>
                  <li>BS Physical Therapy</li>
                  <li>BS Occupational Therapy</li>
                  <li>BS Midwifery</li>
                  <li>BS Respiratory Therapy</li>
                  <li>BS Speech-Language Pathology</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="collapse collapse-arrow bg-base-200"
            >
              <input type="radio" name="degrees" />
              <div className="collapse-title text-xl font-medium">
                Other Notable Programs
              </div>
              <div className="collapse-content">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">
                      Hospitality, Tourism, and Service:
                    </h4>
                    <ul className="list-disc list-inside ml-4">
                      <li>BS Hotel and Restaurant Management</li>
                      <li>BS Tourism Management</li>
                      <li>BS Food Technology</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      Agriculture and Environment:
                    </h4>
                    <ul className="list-disc list-inside ml-4">
                      <li>BS Agriculture</li>
                      <li>BS Forestry</li>
                      <li>BS Environmental Science</li>
                      <li>BS Fisheries</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      Media, Design, and Communication:
                    </h4>
                    <ul className="list-disc list-inside ml-4">
                      <li>BA Communication</li>
                      <li>BA Multimedia Arts</li>
                      <li>BA/BS in Film</li>
                      <li>BA in Photography</li>
                      <li>BA in Fashion Design and Merchandising</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
