import { ReviewClient } from "@/components/ui/review-client";
import fs from "fs";
import path from "path";

// Directories to ignore while listing files
const IGNORED_DIRS = [".git", ".next", "node_modules"];

const getAllFiles = (dir: string, allFiles: string[] = []) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.includes(entry.name)) {
        getAllFiles(fullPath, allFiles);
      }
    } else {
      allFiles.push(fullPath.replace(/^\.\/?/, "")); // remove leading ./ or .
    }
  }

  return allFiles;
};

const getAllFilesFromGit = async () => {
  try {
    const files = getAllFiles(".");
    return { files };
  } catch (error) {
    console.error("Error listing files:", error);
    return { files: [] };
  }
};

async function getSelectedFile(filePath: string) {
  try {
    if (!filePath) {
      return { error: "File path is required" };
    }

    const content = fs.readFileSync(filePath, "utf8");
    return { content };
  } catch (error) {
    console.error("Error fetching file content:", error);
    return { error: "Failed to fetch file content" };
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path: filePath } = await searchParams;
  const data = await getAllFilesFromGit();
  const selectedFile = await getSelectedFile(filePath);

  return (
    <div>
      <header className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Code Review AI Agent</h1>
      </header>

      <div className='page-container'>
        <h2 className='text-xl font-bold'>
          Hi! I&apos;m Code Review Agent, your personal code review AI agent.
        </h2>
        <p>
          I&apos;m here to help you review your code. I&apos;ll give you a
          detailed analysis of the code, including security vulnerabilities,
          code style, and performance optimizations.
        </p>
        <ReviewClient
          files={data?.files || []}
          selectedFile={selectedFile}
          file={filePath}
        />
      </div>
    </div>
  );
}
