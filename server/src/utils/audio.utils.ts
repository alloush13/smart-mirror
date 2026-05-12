import { exec } from 'node:child_process';

export function convertWebmToWav(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = `
ffmpeg -y -i "${inputPath}" "${outputPath}"
`;

    exec(command, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}