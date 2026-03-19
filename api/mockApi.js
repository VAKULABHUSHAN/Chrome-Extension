async function fakeApiCall(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
}
