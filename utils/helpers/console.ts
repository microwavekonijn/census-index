const LOADING_INDICATOR = ['/', '-', '\\', '|'];
const LOADING_ANIMATON_SPEED = 130;

export namespace Console {
  let lastLine: string | undefined = undefined;
  let loadingInterval: NodeJS.Timeout | undefined = undefined;
  let loadingAnimation = 0;
  let loadingMsg: string | undefined = undefined;

  export function writeLine(out: string): void {
    clearLastLine();
    console.log(out);
    lastLine && console.log(lastLine);
  }

  export function loading(msg?: string): void {
    loadingMsg = msg;

    if (!loadingInterval) {
      loadingAnimation = 0;
      loadingInterval = setInterval(() => {
        clearLastLine();
        lastLine = `${LOADING_INDICATOR[loadingAnimation]} ${loadingMsg}`;
        console.log(`${LOADING_INDICATOR[loadingAnimation]} ${loadingMsg}`);
        loadingAnimation = (loadingAnimation + 1) % LOADING_INDICATOR.length;
      }, LOADING_ANIMATON_SPEED);
    }
  }

  export function writeLastLine(out?: string): void {
    if (loadingInterval) clearInterval(loadingInterval);
    clearLastLine();
    lastLine = out;
    out && console.log(out);
  }

  function clearLastLine(): void {
    if (lastLine == undefined) return;

    process.stdout.moveCursor(0, -1 * countLines(lastLine));
    process.stdout.clearScreenDown();
  }

  function countLines(target: string): number {
    let i = 0, count = 0;

    do {
      i = target.indexOf('\n', i);
      count++;
    } while (i++ > 0);

    return count;
  }
}