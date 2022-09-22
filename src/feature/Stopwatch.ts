class Stopwatch {
  private startTime;
  private elapsedTime;
  private running = false;

  get ms() {
    return this.elapsedTime + this.getIntervalTime();
  }

  public start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.startTime = new Date();
    this.elapsedTime = 0;
  }

  public stop() {
    if (!this.running) {
      return;
    }
    this.running = false;
    this.elapsedTime += this.getIntervalTime();
  }

  private getIntervalTime() {
    return new Date() - this.startTime;
  }

  public pause() {
    this.elapsedTime += this.getIntervalTime();
  }

  public resume() {
    this.startTime = new Date();
  }
}

export default Stopwatch;
