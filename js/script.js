function hideCover(cover) {
    cover.style.animationName = "hide-cover";
    cover.style.animationIterationCount = 1;
    cover.style.animationDuration = "0.1s";    
}

function hideOption(nav) {
    if (showMenu) {
        nav.classList.add('hide-option')
    } else {
        nav.classList.remove('hide-option');
    }
    showMenu = !showMenu;
}

document.addEventListener("DOMContentLoaded", async () => {
    // DOM variables
    const body = document.querySelector('body');
    const loadingCover = document.querySelector('#loadingAssets');
    const nav = document.querySelector('nav');
    const navMenu = nav.querySelector('nav #icon');
    const navGroup = nav.querySelector('nav #group');
    const startView = document.querySelector('#startView');
    const editView = document.querySelector('#editView');
    const backBtn = document.querySelector('#bakcBtn');
    const frameSelect = document.getElementById('frameSelect');
    const uploadInput = document.getElementById('upload');
    const paddingSlider = document.getElementById('paddingSlider');
    const hAlignSlider = document.getElementById('hAlignSlider');
    const vAlignSlider = document.getElementById('vAlignSlider');
    const downloadBtn = document.getElementById('downloadBtn');
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');

    // Function to show and hide menu options for medium and smaller viewports
    window.showMenu = false;
    window.addEventListener('resize', () => {
        showMenu = true;
        hideOption(nav);
    });
    window.addEventListener('click', (event) => {
        if (!navGroup.contains(event.target) && !navMenu.contains(event.target)) {
            showMenu = true;
            hideOption(nav);
        }
    });
    navMenu.addEventListener('click', () => {
        hideOption(nav)
    });
    navGroup.querySelector('.about').addEventListener('click', () => {
        window.scrollTo({ 
            top: body.querySelector('#about.section').offsetTop, 
            behavior: 'smooth'
        });
    });
    navGroup.querySelector('.editor').addEventListener('click', () => {
        window.scrollTo({ 
            top: body.querySelector('#edit.section').offsetTop - nav.offsetHeight, 
            behavior: 'smooth'
        });
    });

    body.querySelectorAll('#visitBtn').forEach(el => el.addEventListener('click', () => {
        window.open('https://www.facebook.com/FEUD.APD', '_blank');
    }));

    let uploadedImage = null;
    let frameImage = null;

    editBtn.addEventListener('click', () => {
        editView.classList.remove('hide');
        startView.classList.add('hide');
    });
    backBtn.addEventListener('click', () => {
        editView.classList.add('hide');
        startView.classList.remove('hide');
    });

    // Draw preview function
    function drawPreview() {
        console.log(canvas.width);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ✅ White background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const basePaddingPercent = 15; // Base padding in percent
        const zoomMultiplier = parseFloat(paddingSlider.value); // 0.5 to 2
        const paddingPercent = (basePaddingPercent * zoomMultiplier) / 100; // fixed
        const usableWidth = canvas.width * (1 - 2 * paddingPercent);
        const usableHeight = canvas.height * (1 - 2 * paddingPercent);
        const offsetXCanvas = canvas.width * paddingPercent;
        const offsetYCanvas = canvas.height * paddingPercent;

        if (uploadedImage) {
            const imgRatio = uploadedImage.width / uploadedImage.height;
            const canvasRatio = usableWidth / usableHeight;
            let drawWidth, drawHeight, offsetX, offsetY;

            if (imgRatio > canvasRatio) {
                // ✅ Wider image → fit width
                drawWidth = usableWidth;
                drawHeight = usableWidth / imgRatio;
                offsetX = offsetXCanvas;
                offsetY = offsetYCanvas + (usableHeight - drawHeight) / 2;
            } else {
                // ✅ Taller image → fit height
                drawHeight = usableHeight;
                drawWidth = usableHeight * imgRatio;
                offsetX = offsetXCanvas + (usableWidth - drawWidth) / 2;
                offsetY = offsetYCanvas;
            }

            // ✅ Apply horizontal and vertical alignment sliders
            const hOffset = (hAlignSlider.value / 100) * usableWidth; // -50% to 50%
            const vOffset = (vAlignSlider.value / 100) * usableHeight; // -50% to 50%
            offsetX += hOffset;
            offsetY += vOffset;

            ctx.drawImage(uploadedImage, offsetX, offsetY, drawWidth, drawHeight);
        }

        if (frameImage) {
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        }
    }

    // Enable/disable download button and sliders
    function updateUIControls() {
        const canUse = uploadedImage && frameImage;
        downloadBtn.disabled = !canUse;
        paddingSlider.disabled = !canUse;
        hAlignSlider.disabled = !canUse;
        vAlignSlider.disabled = !canUse;
    }
    updateUIControls();

    // Handle image upload
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            uploadedImage = null;
            updateUIControls();
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            uploadedImage = new Image();
            uploadedImage.src = evt.target.result;
            uploadedImage.onload = () => {
                drawPreview();
                updateUIControls();
            };
        };
        reader.readAsDataURL(file);
    });


    // Handle frame selection
    function renderFrame() {
        if (frameSelect.value) {
            frameImage = new Image();
            frameImage.src = frameSelect.value;
            frameImage.onload = drawPreview;
        } else {
            frameImage = null;
        }
    }
    frameSelect.addEventListener('change', renderFrame);
    renderFrame();

    // Handle image upload
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            uploadedImage = new Image();
            uploadedImage.src = evt.target.result;
            uploadedImage.onload = () => {
                drawPreview();
                updateUIControls();
            };
        };
        reader.readAsDataURL(file);
    });

    // Handle sliders
    [paddingSlider, hAlignSlider, vAlignSlider].forEach(slider => {
        slider.addEventListener('input', drawPreview);
    });

    // Download button click
    downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!uploadedImage || !frameImage) return;

        const link = document.createElement('a');
        link.download = 'framed-image.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    hideCover(loadingCover);
});