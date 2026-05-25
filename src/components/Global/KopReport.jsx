const toBase64 = (url) =>
    fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
  
  // Fungsi utama
const kopReportPdf = async (logo, title) => {
    const images = await toBase64(logo);
    return {
        images,
        title,
    };
};
  
export { kopReportPdf };