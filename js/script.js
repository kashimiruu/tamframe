function hideCover(cover) {
    cover.style.animationName = "hide-cover";
    cover.style.animationIterationCount = 1;
    cover.style.animationDuration = "0.1s";
    cover.style.animationDelay = "1s";    
}

function hideOption(nav) {
    if (showMenu) {
        nav.classList.add('hide-option')
    } else {
        nav.classList.remove('hide-option');
    }
    showMenu = !showMenu;
}

function selectFrame(value, name) {
    const selected = document.querySelector('#frameSelect #selected');
    if (selected) selected.innerHTML = name;

    frameImage = new Image();
    frameImage.src = value;
    frameImage.onload = drawPreview;
}

function toggleFrames() {
    showFramesOption = !showFramesOption;
    if (showFramesOption) frameSelect.classList.add('toggled')
    else frameSelect.classList.remove('toggled');
}

// Enable/disable download button and sliders
function updateUIControls() {
    const canUse = uploadedImage && frameImage;
    if (downloadBtn) [downloadBtn, paddingSlider, hAlignSlider,vAlignSlider].forEach(control => {if(control) control.disabled = !canUse});
}

// Wait for assets before hiding loading cover
function preloadAssets(imagePaths, callback) {
    let loadedCount = 0;
    const total = imagePaths.length;

    imagePaths.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedCount++;
            if (loadedCount === total) {
                callback();
            }
        };
        img.onerror = () => {
            console.warn("Failed to load:", src);
            loadedCount++;
            if (loadedCount === total) {
                callback();
            }
        };
    });
}

// Draw preview function
function drawPreview() {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    // ✅ White background
    if (ctx) ctx.fillStyle = "white";
    ctx?.fillRect(0, 0, canvas.width, canvas.height);

    const basePaddingPercent = 15; // Base padding in percent
    const zoomMultiplier = parseFloat(paddingSlider?.value); // 0.5 to 2
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

document.addEventListener("DOMContentLoaded", async () => {
    // DOM variables
    const body = document.querySelector('body');
    const loadingCover = document.querySelector('#loadingAssets');
    const nav = document.querySelector('nav');
    const navMenu = nav.querySelector('#icon');
    const navGroup = nav.querySelector('#group');
    const startView = document.querySelector('#startView');
    const editView = document.querySelector('#editView');
    const backBtn = document.querySelector('#bakcBtn');
    const editBtn = document.querySelector('#editBtn');
    const frameSelect = document.getElementById('frameSelect');
    const uploadInput = document.getElementById('upload');
    window.paddingSlider = document.getElementById('paddingSlider');
    window.hAlignSlider = document.getElementById('hAlignSlider');
    window.vAlignSlider = document.getElementById('vAlignSlider');
    window.downloadBtn = document.getElementById('downloadBtn');
    window.canvas = document.getElementById('previewCanvas');
    window.ctx = canvas?.getContext('2d');

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
            top: window.innerHeight, 
            behavior: 'smooth'
        });
    });
    navGroup.querySelector('.editor').addEventListener('click', () => {
        window.scrollTo({ 
            top: body.querySelector('#edit.section').offsetTop - nav.offsetHeight, 
            behavior: 'smooth'
        });
    });
    navGroup.querySelector('.compose').onclick = () => {
        window.open('./compose.html', '_self');  
    };
    const footer = document.querySelector('#edit.section .footer');
    if (footer) {
        footer.onclick = () => {
            window.open('./compose.html', '_self');
        };
    }

    body.querySelectorAll('#visitBtn').forEach(el => el.addEventListener('click', () => {
        window.open('https://www.facebook.com/FEUD.APD', '_blank');
    }));

    const frameOptions = [
        {
            name: "IT Faculty",
            value: "/frames/faculty-it.png",
        },
        {
            name: "BSIT - AGD",
            value: "/frames/student-agd.png",
        },
        {
            name: "BSIT - CST",
            value: "/frames/student-cst.png",
        },
        {
            name: "BSCS - SE",
            value: "/frames/student-se.png",
        },
        {
            name: "BSIT - WMA",
            value: "/frames/student-wma.png",
        },
    ]

    // Handle frame selection
    window.uploadedImage = null;
    window.showFramesOption = false;
    let frameImage = null;

    const frameBtn = frameSelect?.querySelector('#menu');
    const frameGroup = frameSelect?.querySelector('#group');
    const frameSelected = frameSelect?.querySelector('#selected');
    frameBtn?.addEventListener('click', toggleFrames);
    frameSelected,addEventListener('click', toggleFrames);
    body.addEventListener('click', (event) => {
        if (!frameBtn.contains(event.target) && !frameSelected.contains(event.target)) {
            showFramesOption = true;
            toggleFrames();
        }
    });
    window.addEventListener('resize', () => {
        showFramesOption = true;
        toggleFrames();
    });
    frameOptions.forEach(option => {
        if (frameGroup) frameGroup.innerHTML += `
            <div class="option input" onclick="selectFrame('${option.value}', '${option.name}')"> ${option.name} </div>
        `;
    });
    selectFrame(frameOptions[0].value, frameOptions[0].name);


    editBtn?.addEventListener('click', () => {
        editView.classList.remove('hide');
        startView.classList.add('hide');
    });
    backBtn?.addEventListener('click', () => {
        editView.classList.add('hide');
        startView.classList.remove('hide');
    });
    updateUIControls();

    // Handle image upload
    uploadInput?.addEventListener('change', (e) => {
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

    // Handle image upload
    uploadInput?.addEventListener('change', (e) => {
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
        slider?.addEventListener('input', drawPreview);
    });

    // Download button click
    downloadBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (!uploadedImage || !frameImage) return;

        const link = document.createElement('a');
        link.download = 'framed-image.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    // Usage in your index.js
    window.addEventListener("load", () => {
        const framePaths = [
            "frames/faculty-it.png",
            "frames/student-agd.png",
            "frames/student-cst.png",
            "frames/student-se.png",
            "frames/student-wma.png"
        ];

        preloadAssets(framePaths, () => {
            hideCover(loadingCover);
        });
    });
});