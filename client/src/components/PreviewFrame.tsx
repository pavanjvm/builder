import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  // In a real implementation, this would compile and render the preview
  const [url, setUrl] = useState("");
  const [isInstalling, setIsInstalling] = useState(false);

  async function main() {
    // Wait for files to be created first
    if (!files || files.length === 0) {
      console.log('PreviewFrame: No files yet, waiting...');
      return;
    }

    // Prevent multiple runs
    if (isInstalling || url) {
      return;
    }

    setIsInstalling(true);
    console.log('PreviewFrame: Starting npm install...');

    try {
      const installProcess = await webContainer.spawn('npm', ['install']);

      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log(data);
        }
      }));

      // Wait for npm install to complete
      await installProcess.exit;
      console.log('PreviewFrame: npm install completed');

      console.log('PreviewFrame: Starting dev server...');
      await webContainer.spawn('npm', ['run', 'dev']);

      // Wait for `server-ready` event
      webContainer.on('server-ready', (port, url) => {
        console.log('PreviewFrame: Server ready at', url, 'port:', port);
        setUrl(url);
        setIsInstalling(false);
      });
    } catch (error) {
      console.error('PreviewFrame: Error during setup:', error);
      setIsInstalling(false);
    }
  }

  useEffect(() => {
    main()
  }, [files]) // Re-run when files change
  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url && <div className="text-center">
        <p className="mb-2">
          {!files || files.length === 0
            ? "Waiting for files to be created..."
            : isInstalling
              ? "Installing dependencies and starting server..."
              : "Loading..."
          }
        </p>
      </div>}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}