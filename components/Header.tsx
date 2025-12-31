import Link from "next/link";
import React from "react";
import { MdGraphicEq, MdOutlineSettings } from "react-icons/md";

function Header() {
  return (
    <div className="flex items-center justify-between md:py-4 py-3 md:w-[90%] mx-auto  w-full  px-6 md:px-0 fixed md:relative  bg-[#1d2e24] md:bg-transparent top-0 md:top-auto z-50">
      <Link className="flex items-center gap-2" href="/">
        <span className="text-primary md:text-xl ">
          <MdGraphicEq />
        </span>
        <h6 className="font-semibold md:text-lg text-sm">PitchPerfect</h6>
      </Link>
      <button className="text-white bg-gray-800 p-1 rounded-full md:text-lg cursor-pointer">
        <MdOutlineSettings />
      </button>
    </div>
  );
}

export default Header;
