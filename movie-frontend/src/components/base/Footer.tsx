import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <div>
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white mb-4">Help</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-white transition">
                  Help
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  About Rotten Tomatoes
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-white transition">
                  Critic Submission
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Licensing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Advertise With Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white mb-4">Join the Newsletter</h3>
            <p>
              Get the freshest reviews, news, and more delivered right to your
              inbox!
            </p>
            <button className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Join us
            </button>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left">
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition mx-2"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition mx-2"
            >
              Terms and Policies
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition mx-2"
            >
              Cookie Notice
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition mx-2"
            >
              California Notice
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition mx-2"
            >
              Ad Choices
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition mx-2"
            >
              Accessibility
            </Link>
          </div>
          <div className="text-center md:text-right mt-4 md:mt-0">
            <p className="text-gray-400">
              &copy; Copyright Fandango. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
