import { videos } from './data.js';
import { FeedView } from './feedView.js';
import { FeedController } from './feedController.js';
const feedElement = document.getElementById('feed');
const statusElement = document.getElementById('statusPill');
const view = new FeedView(feedElement);
const controller = new FeedController({ feedElement, statusElement, videos, view });
controller.init();
