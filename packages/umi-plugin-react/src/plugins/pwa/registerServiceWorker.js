import { register } from 'register-service-worker';

function dispathServiceWorkerEvent(eventName) {
  const event = document.createEvent('Event');
  event.initEvent(eventName, true, true);
  window.dispatchEvent(event);
}

export default function(swDest) {
  if (process.env.NODE_ENV === 'production') {
    register(`${process.env.BASE_URL}${swDest}`, {
      updated() {
        dispathServiceWorkerEvent('sw.updated');
      },

      offline() {
        dispathServiceWorkerEvent('sw.offline');
      },
    });
  }
}
