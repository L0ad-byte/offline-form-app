// app.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('status');
  const exportButton = document.getElementById('exportButton');

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
      timestamp: new Date().toLocaleString()
    };

    if (navigator.onLine) {
      // Online: Process form (e.g., send via EmailJS or other method)
      // Since Google Sheets and EmailJS are excluded, we'll just show a success message
      // You can integrate EmailJS here if desired
      status.textContent = 'Thank you for your message!';
      form.reset();
    } else {
      // Offline: Save data to IndexedDB
      saveFormData(formData);
      status.textContent = 'You are offline. Your message has been saved and will be exported later.';
      form.reset();
    }
  });

  // Save Form Data to IndexedDB
  function saveFormData(data) {
    const request = indexedDB.open('offlineForms', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const store = db.createObjectStore('forms', { keyPath: 'id', autoIncrement: true });
      store.createIndex('timestamp', 'timestamp', { unique: false });
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('forms', 'readwrite');
      const store = transaction.objectStore('forms');
      store.add(data);
      transaction.oncomplete = () => {
        console.log('Form data saved locally.');
      };
      transaction.onerror = (e) => {
        console.error('Error saving form data:', e.target.errorCode);
      };
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.errorCode);
    };
  }

  // Export Data as JSON
  exportButton.addEventListener('click', () => {
    exportData();
  });

  function exportData() {
    const request = indexedDB.open('offlineForms', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('forms', 'readonly');
      const store = transaction.objectStore('forms');
      const getAll = store.getAll();

      getAll.onsuccess = () => {
        const forms = getAll.result;
        if (forms.length === 0) {
          alert('No data to export.');
          return;
        }

        const dataStr = JSON.stringify(forms, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'form_submissions.json';
        a.click();

        URL.revokeObjectURL(url);
      };
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.errorCode);
    };
  }

  // Automatically Notify User When Back Online
  window.addEventListener('online', () => {
    // Optionally, you can implement automatic data export or syncing here
    console.log('You are back online.');
    alert('You are back online. You can export your saved submissions now.');
  });
});
