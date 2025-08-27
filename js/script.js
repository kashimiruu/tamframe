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
    if (!frameSelect) return;
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

// Draw previews
function drawPreview() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ✅ White background
    if (ctx) ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (uploadedImage) {
        const imgRatio = uploadedImage.width / uploadedImage.height;
        const canvasRatio = canvas.width / canvas.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > canvasRatio) {
            // ✅ Image is wider → fit height, crop sides
            drawHeight = canvas.height;
            drawWidth = drawHeight * imgRatio;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            // ✅ Image is taller → fit width, crop top/bottom
            drawWidth = canvas.width;
            drawHeight = drawWidth / imgRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        }

        // ✅ Apply zoom (paddingSlider as zoom multiplier)
        const zoom = parseFloat(paddingSlider?.value || 1); // default 1
        drawWidth *= zoom;
        drawHeight *= zoom;

        // ✅ Recenter after zoom
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = (canvas.height - drawHeight) / 2;

        // ✅ Apply alignment sliders
        const hOffset = (hAlignSlider.value / 100) * canvas.width; 
        const vOffset = (vAlignSlider.value / 100) * canvas.height; 
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
    window.frameSelect = document.getElementById('frameSelect');
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
            name: "College of Computer Studies",
            value: "frames/faculty-it.png",
        },
    ]

    // Handle frame selection
    window.uploadedImage = null;
    window.showFramesOption = false;
    window.frameImage = null;

    const frameGroup = frameSelect?.querySelector('#group');
    const frameSelected = frameSelect?.querySelector('#selected');
    frameSelected,addEventListener('click', toggleFrames);
    body.addEventListener('click', (event) => {
        if (!frameSelected?.contains(event.target)) {
            showFramesOption = false;
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
