export class FeedController {
  constructor({ feedElement, statusElement, videos, view }) {
    this.feedElement = feedElement;
    this.statusElement = statusElement;
    this.videos = videos;
    this.view = view;
    this.activeIndex = 0;
    this.liked = new Set();
    this.observer = null;
    this.muted = true;
  }
  init() {
    this.view.render(this.videos);
    this.feedElement.tabIndex = 0;
    this.bindEvents();
    this.setupObserver();
    requestAnimationFrame(() => this.activateSlide(0));
  }
  bindEvents() {
    this.feedElement.addEventListener("click", this.handleClick.bind(this));
    this.feedElement.addEventListener("keydown", this.handleKeydown.bind(this));
    document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this));
  }
  handleMuteChange() {
    const video = this.view.getVideo(this.activeIndex);
    video.muted = !this.muted;
    this.muted = !this.muted;
    event.target.closest(".mute-btn").setAttribute("aria-label", this.muted ? "Включить звук" : "Выключить звук");
    this.updateStatus(this.activeIndex, this.muted ? "mute" : "sound on");
  }
  handleClick(event) {
    const index = this.activeIndex;
    const video = this.view.getVideo(index);
    if (!video) return;
    if (event.target.closest(".like-btn")) {
      const liked = !this.liked.has(index);
      if (liked) this.liked.add(index);
      else this.liked.delete(index);
      this.view.setLiked(index, liked);
      return;
    }
    if (event.target.closest(".mute-btn")) {
      this.handleMuteChange();
      return;
    }
    if (video.paused) this.activateSlide(index);
    else {
      video.pause();
      this.view.setOverlayVisible(index, true);
      this.updateStatus(index, "paused");
    }
  }
  handleKeydown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.scrollToIndex(Math.min(this.videos.length - 1, this.activeIndex + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.scrollToIndex(Math.max(0, this.activeIndex - 1));
    }
    if (event.code === "Space") {
      event.preventDefault();
      const video = this.view.getVideo(this.activeIndex);
      if (!video) return;
      if (video.paused) this.activateSlide(this.activeIndex);
      else {
        video.pause();
        this.view.setOverlayVisible(this.activeIndex, true);
        this.updateStatus(this.activeIndex, "paused");
      }
    }
  }
  handleVisibilityChange() {
    if (document.hidden) {
      this.pauseAll();
      this.updateStatus(this.activeIndex, "paused");
    } else this.activateSlide(this.activeIndex);
  }
  setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number(visible.target.dataset.index);
        const currentVideo = this.view.getVideo(index);
        if (index !== this.activeIndex || currentVideo?.paused) this.activateSlide(index);
      },
      { root: this.feedElement, threshold: [0.6, 0.75, 0.95] },
    );
    this.view.getSlides().forEach((slide) => this.observer.observe(slide));
  }
  scrollToIndex(index) {
    this.view.getSlide(index)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  pauseAll(exceptIndex = -1) {
    this.view.getSlides().forEach((slide, index) => {
      const video = slide.querySelector("video");
      if (!video) return;
      cancelAnimationFrame(video._rafId || 0);
      if (index !== exceptIndex) {
        video.pause();
        this.view.setOverlayVisible(index, true);
        this.view.setProgress(index, 0);
      }
    });
  }
  updateStatus(index, state) {
    const item = this.videos[index];
    this.statusElement.textContent = `${index + 1}/${this.videos.length} · @${item.author} · ${state}`;
  }
  animateProgress(index, video) {
    cancelAnimationFrame(video._rafId || 0);
    const tick = () => {
      const ratio = video.duration ? video.currentTime / video.duration : 0;
      this.view.setProgress(index, ratio);
      if (!video.paused) video._rafId = requestAnimationFrame(tick);
    };
    video._rafId = requestAnimationFrame(tick);
  }
  async activateSlide(index) {
    const video = this.view.getVideo(index);
    video.muted = this.muted;
    if (!video) return;
    this.activeIndex = index;
    this.pauseAll(index);
    try {
      await video.play();
      this.view.setOverlayVisible(index, false);
      this.animateProgress(index, video);
      this.updateStatus(index, this.muted ? "mute" : "sound on");
    } catch {
      this.view.setOverlayVisible(index, true);
      this.updateStatus(index, "paused");
    }
  }
}
