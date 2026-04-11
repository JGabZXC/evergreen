import { Link } from "react-router";
import notFoundImage from "../assets/UFO404.png";

export default function NotFound404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center">
        <div className="w-[40%] mx-auto mb-6">
          <img src={notFoundImage} alt="Page Not Found" />
        </div>
        <h2 className="text-4xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-lg mb-8 text-gray-600">
          Sorry, the page you are looking for doesn't exist.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
