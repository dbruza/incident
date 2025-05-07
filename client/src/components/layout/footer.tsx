import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Headset, Settings } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[hsl(240_10%_3.9%)] border-t border-gray-800 mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="#" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">Help Center</span>
            <QuestionMarkCircledIcon className="h-5 w-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">Support</span>
            <Headset className="h-5 w-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">Settings</span>
            <Settings className="h-5 w-5" />
          </a>
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} NightGuard Incident Register. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
