import { formatCount } from "./utils.js";
export class FeedView {
  constructor(root) {
    this.root = root;
  }
  render(videos) {
    this.root.innerHTML = videos
      .map(
        (video, index) => `
      <section class="slide" data-index="${index}" aria-label="Видео ${index + 1}: ${video.title}">
        <video playsinline preload="metadata" muted loop src="${video.src}" aria-label="${video.title}"></video>
        <div class="overlay-play" aria-hidden="true"><span><svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M8 6L18 12L8 18V6Z" fill="white"/></svg></span></div>
        <div class="meta"><div class="author-row"><div class="avatar" aria-hidden="true">${video.author.slice(0, 1).toUpperCase()}</div><div class="author-name">@${video.author}</div><div class="tag">${video.title}</div></div><p class="caption">${video.caption}</p><div class="progress" aria-hidden="true"><span></span></div></div>
        <div class="actions" aria-label="Действия с видео"><button class="action-btn like-btn" type="button" aria-label="Поставить лайк"><svg viewBox="0 0 24 24" fill="none"><path d="M12 20.5S4 15.4 4 9.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 3.5c0 5.9-8 11-8 11Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="action-count">${formatCount(video.likes)}</div><button class="action-btn" type="button" aria-label="Комментарии"><svg viewBox="0 0 24 24" fill="none"><path d="M21 11.5C21 16.194 16.97 20 12 20a9.97 9.97 0 0 1-4.35-.985L3 20l1.17-3.51A8.08 8.08 0 0 1 3 11.5C3 6.806 7.03 3 12 3s9 3.806 9 8.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="action-count">${formatCount(video.comments)}</div><button class="action-btn mute-btn" type="button" aria-label="Выключить звук"><svg viewBox="0 0 24 24" fill="none"><path d="M14 5L9.5 9H6v6h3.5L14 19V5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M18.5 9.5a4 4 0 0 1 0 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>
      </section>`,
      )
      .join("");
  }
  getSlides() {
    return [...this.root.querySelectorAll(".slide")];
  }
  getSlide(index) {
    return this.root.querySelector(`.slide[data-index="${index}"]`);
  }
  getVideo(index) {
    return this.getSlide(index)?.querySelector("video") ?? null;
  }
  setOverlayVisible(index, visible) {
    this.getSlide(index)?.querySelector(".overlay-play")?.classList.toggle("visible", visible);
  }
  setProgress(index, ratio) {
    const bar = this.getSlide(index)?.querySelector(".progress > span");
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, ratio * 100))}%`;
  }
  setLiked(index, liked) {
    this.getSlide(index)?.querySelector(".like-btn")?.classList.toggle("is-liked", liked);
  }
}
