"use client";
import Link from "next/link";
import { IoMdMusicalNote } from "react-icons/io";
import { RiArrowRightSLine } from "react-icons/ri";
import { TiMediaPlay } from "react-icons/ti";
import { GiMusicalNotes, GiMusicalScore } from "react-icons/gi";
import { FaKey } from "react-icons/fa";

export default function Home() {
  return (
    <div className="md:w-[90%] px-6 md:px-0 md:mx-auto ">
      <div className="text-[10rem]  mx-auto text-center flex w-full justify-center">
        <GiMusicalScore />
      </div>
      <div className="text-center mt-6">
        <h1 className="md:text-[2.5rem] text-xl font-semibold">
          Hi there, Maestro!
        </h1>
        <p className="md:text-lg mt-3 text-sm">
          Train your ear to identify any note, anywhere. Ready to start your
          session?
        </p>
      </div>
      <div className="grid md:grid-cols-2 md:w-[80%] mx-auto mt-10">
        <Link
          href="/quiz"
          className="group w-full p-1 bg-gradient-to-r from-surface-dark to-card-dark rounded-xl hover:from-primary/20 hover:to-surface-dark transition-all duration-300"
        >
          <div className="flex items-center gap-4 bg-background-dark/50 backdrop-blur-sm p-4 rounded-xl order border-white/5 group-hover:border-primary/30 transition-colors">
            <div className="md:size-14 size-12 md:text-2xl rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <IoMdMusicalNote />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-white font-bold md:text-base text-sm">
                Pitch Quiz
              </h4>
              <p className="text-text-muted md:text-sm text-xs">
                Test your ear with random notes
              </p>
            </div>
            <span className="md:text-[1.8rem]">
              <RiArrowRightSLine />
            </span>
          </div>
        </Link>
        <Link
          href="/vocal-lesson"
          className="group w-full p-1 bg-gradient-to-r from-surface-dark to-card-dark rounded-xl hover:from-primary/20 hover:to-surface-dark transition-all duration-300"
        >
          <div className="flex items-center gap-4 bg-background-dark/50 backdrop-blur-sm p-4 rounded-xl border border-white/5 group-hover:border-blue-400/30 transition-colors">
            <div className="md:size-14 size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300 text-[1.8rem]">
              <GiMusicalNotes />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-white font-bold md:text-base text-sm">
                Vocal Gym
              </h4>
              <p className="text-text-muted md:text-sm text-xs">
                Sing the correct note
              </p>
            </div>
            <span className="md:text-[1.8rem]">
              <RiArrowRightSLine />
            </span>
          </div>
        </Link>
        <Link
          href="/playground"
          className="group w-full p-1 bg-gradient-to-r from-surface-dark to-card-dark rounded-xl hover:from-primary/20 hover:to-surface-dark transition-all duration-300"
        >
          <div className="flex items-center gap-4 bg-background-dark/50 backdrop-blur-sm p-4 rounded-xl border border-white/5 group-hover:border-purple-400/30 transition-colors">
            <div className="md:size-14 size-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300 text-[1.8rem]">
              <TiMediaPlay />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-white font-bold md:text-base text-sm">
                Playground
              </h4>
              <p className="text-text-muted md:text-sm text-xs ">
                <span>Know your notes</span>
              </p>
            </div>
            <span className="md:text-[1.8rem]">
              <RiArrowRightSLine />
            </span>
          </div>
        </Link>
        <Link
          href="/keyfinder"
          className="group w-full p-1 bg-gradient-to-r from-surface-dark to-card-dark rounded-xl hover:from-primary/20 hover:to-surface-dark transition-all duration-300"
        >
          <div className="flex items-center gap-4 bg-background-dark/50 backdrop-blur-sm p-4 rounded-xl border border-white/5 group-hover:border-yellow-400/30 transition-colors">
            <div className="md:size-14 size-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform duration-300 text-[1.8rem]">
              <FaKey />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-white font-bold md:text-base text-sm">
                Key Finder
              </h4>
              <p className="text-text-muted md:text-sm text-xs">
                <span>Find your key</span>
              </p>
            </div>
            <span className="md:text-[1.8rem]">
              <RiArrowRightSLine />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
