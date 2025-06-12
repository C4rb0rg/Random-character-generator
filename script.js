// Define the base path for your assets
const ASSET_BASE_PATH = './assets/';

// Define the available assets for each part
// IMPORTANT: Replace these placeholder filenames with your actual SVG filenames
// and adjust the counts if you have more or fewer files.
const assets = {
  face: 'Face.svg',
  pupils: [
    'pupil-1.svg',
    'pupil-2.svg',
    'pupil-3.svg'
  ],
  mouth: [
    'mouth-1.svg',
    'mouth-2.svg',
    'mouth-3.svg',
    'mouth-4.svg',
    'mouth-5.svg'
  ],
  nose: [
    'nose-1.svg',
    'nose-2.svg',
    'nose-3.svg',
    'nose-4.svg',
    'nose-5.svg'
  ],
  eyebrows: [
    'brow-1.svg',
    'brow-2.svg',
    'brow-3.svg',
    'brow-4.svg',
    'brow-5.svg'
  ],
  sclera: [
    'sclera.svg',
    'sunglasses.svg',
    'sclera-with-lashes.svg'
  ],
  hat: [
    '',
    'hat-1.svg',
    'hat-2.svg',
    'hat-3.svg',
    'hat-4.svg'
  ]
};

// Keep track of the current index for each part
const currentPartIndex = {
    pupils: 0,
    mouth: 0,
    nose: 0,
    eyebrows: 0,
    sclera: 0,
    hat: 0 // Initialize hat index to 0 (no hair)
};

// Get references to the image elements (main display)
const facePart = document.getElementById('face-part');
const scleraPart = document.getElementById('sclera-part');
const pupilsPart = document.getElementById('pupils-part');
const eyebrowsPart = document.getElementById('eyebrows-part');
const nosePart = document.getElementById('nose-part');
const mouthPart = document.getElementById('mouth-part');
const hatPart = document.getElementById('hat-part');

// Get references to the thumbnail image elements
const hatThumbnail = document.getElementById('hat-thumbnail');
const scleraThumbnail = document.getElementById('sclera-thumbnail');
const pupilsThumbnail = document.getElementById('pupils-thumbnail');
const eyebrowsThumbnail = document.getElementById('eyebrows-thumbnail');
const noseThumbnail = document.getElementById('nose-thumbnail');
const mouthThumbnail = document.getElementById('mouth-thumbnail');

// Get references to control groups for dynamic visibility
const pupilsControlGroup = document.getElementById('pupils-control-group');
const eyebrowsControlGroup = document.getElementById('eyebrows-control-group');


/**
 * Initializes the character generator by loading default assets.
 */
function initializeCharacter() {
    // Load the base face
    const facePath = `${ASSET_BASE_PATH}${encodeURIComponent(assets.face)}`;
    facePart.src = facePath;
    console.log('Attempting to load face from:', facePath); // Log the path for debugging

    // Load initial assets for other parts and update their thumbnails
    loadPart('pupils');
    loadPart('mouth');
    loadPart('nose');
    loadPart('eyebrows');
    loadPart('sclera'); // Load sclera last to trigger special case check
    loadPart('hat'); // Load hat last to apply specific "no hair" logic
}

/**
 * Loads the SVG asset for a given part based on its current index,
 * converts it to a data URL, and sets it as the src for the image element.
 * Also updates the corresponding thumbnail image.
 * @param {string} partName - The name of the character part (e.g., 'pupils', 'mouth').
 */
async function loadPart(partName) { // Make loadPart async
    const index = currentPartIndex[partName];
    let imgElement; // For the main character display
    let thumbnailElement; // For the thumbnail preview
    let assetPath;
    let thumbnailUrl;

    if (partName === 'face') {
        imgElement = facePart;
        assetPath = `${ASSET_BASE_PATH}${encodeURIComponent(assets.face)}`;
        thumbnailUrl = assetPath; // No thumbnail for face, but for consistency if needed
    } else {
        imgElement = document.getElementById(`${partName}-part`);
        thumbnailElement = document.getElementById(`${partName}-thumbnail`);

        if (partName === 'hat' && index === 0) {
            // Special handling for "no hair" option: hide main part, use face for thumbnail
            assetPath = ''; // No actual asset for the main part
            imgElement.style.display = 'none'; // Hide the hat part entirely
            thumbnailUrl = `${ASSET_BASE_PATH}${encodeURIComponent(assets.face)}`; // Use face.svg for thumbnail
        } else {
            // For all other assets, construct the path
            assetPath = `${ASSET_BASE_PATH}${partName}/${encodeURIComponent(assets[partName][index])}`;
            imgElement.style.display = 'block'; // Ensure the part is visible
            thumbnailUrl = assetPath; // Thumbnail path is the same as the main asset path
        }
    }

    if (imgElement && assetPath) {
        try {
            // Fetch the SVG content as text
            const response = await fetch(assetPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch SVG: ${response.statusText}`);
            }
            const svgText = await response.text();
            // Encode the SVG text as a data URL
            const encodedSvg = `data:image/svg+xml;charset=utf8,${encodeURIComponent(svgText)}`;
            imgElement.src = encodedSvg;
        } catch (error) {
            console.error(`Error loading SVG for ${partName} from ${assetPath}:`, error);
            // Fallback for error: set empty src or a placeholder if fetching fails
            imgElement.src = ''; // Or a default placeholder image URL
        }
    } else if (imgElement && partName === 'hat' && index === 0) {
        // Special case for 'no hat' where assetPath is empty
        imgElement.src = '';
    }

    // Update thumbnail regardless of main image loading issues
    if (thumbnailElement) {
        if (partName === 'face' && thumbnailElement) { // No thumbnail for face
            // Do nothing or set to a default if a face thumbnail is desired later
        } else if (partName === 'hat' && index === 0 && thumbnailElement) {
            // Thumbnail for "no hat" uses face.svg
            thumbnailElement.src = `${ASSET_BASE_PATH}${encodeURIComponent(assets.face)}`;
        }
        else if (thumbnailElement) {
            try {
                // Fetch thumbnail SVG content and convert to data URL if it's an SVG
                const response = await fetch(thumbnailUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch thumbnail SVG: ${response.statusText}`);
                }
                const svgText = await response.text();
                const encodedSvg = `data:image/svg+xml;charset=utf8,${encodeURIComponent(svgText)}`;
                thumbnailElement.src = encodedSvg;
            } catch (error) {
                console.error(`Error loading thumbnail SVG for ${partName} from ${thumbnailUrl}:`, error);
                thumbnailElement.src = ''; // Fallback
            }
        }
    }

    handleScleraSpecialCases();
}

/**
 * Handles the special cases for sclera assets (sunglasses, sclera with eyebrow).
 * Adjusts visibility of pupils and eyebrows accordingly.
 * The control groups for pupils and eyebrows will now always remain visible.
 */
function handleScleraSpecialCases() {
    const currentScleraAsset = assets.sclera[currentPartIndex.sclera];

    // If sunglasses are active, hide pupils part, but keep its controls visible
    if (currentScleraAsset.includes('sunglasses')) {
        pupilsPart.style.display = 'none';
    } else {
        pupilsPart.style.display = 'block';
    }

    // REMOVED: The logic to hide eyebrows based on 'sclera with lashes'
    // This ensures the eyebrows will always be visible, regardless of the sclera asset.
    eyebrowsPart.style.display = 'block';
}

/**
 * Changes the currently displayed asset for a given part.
 * Cycles through the assets array for that part.
 * @param {string} partName - The name of the character part.
 * @param {number} direction - 1 for next, -1 for previous.
 */
function changePart(partName, direction) {
    const totalAssets = assets[partName].length;
    let newIndex = currentPartIndex[partName] + direction;

    // Loop back to the beginning or end of the array
    if (newIndex >= totalAssets) {
        newIndex = 0;
    } else if (newIndex < 0) {
        newIndex = totalAssets - 1;
    }

    currentPartIndex[partName] = newIndex;
    loadPart(partName);
}

/**
 * Randomizes all character parts.
 */
function randomizeCharacter() {
    for (const partName in currentPartIndex) {
        if (assets[partName]) { // Ensure the part has defined assets
            const totalAssets = assets[partName].length;
            const randomIndex = Math.floor(Math.random() * totalAssets);
            currentPartIndex[partName] = randomIndex;
            loadPart(partName);
        }
    }
    // Explicitly call handleScleraSpecialCases one more time after all parts
    // have been randomized to ensure correct visibility of pupils/eyebrows.
    handleScleraSpecialCases();
}

/**
 * Waits for an Image element to load.
 * @param {HTMLImageElement} img - The image element to wait for.
 * @returns {Promise<void>} A promise that resolves when the image is loaded.
 */
function loadImage(img) {
    return new Promise((resolve, reject) => {
        if (img.complete && img.naturalHeight !== 0 && img.src) {
            // Image is already loaded and has a valid source
            resolve();
            return;
        }
        img.onload = () => resolve();
        img.onerror = () => {
            console.warn('Failed to load image:', img.src);
            reject(new Error(`Failed to load image: ${img.src}`));
        };
        // If image src is empty (e.g., for 'no hat'), resolve immediately
        if (!img.src) {
            resolve();
        }
    });
}

/**
 * Renders the current character display to an image and saves it as a JPEG.
 */
async function saveCharacter() {
    const characterDisplay = document.querySelector('.character-display');
    const displayRect = characterDisplay.getBoundingClientRect(); // Get overall display bounds

    // Ensure all visible parts are loaded before proceeding
    const allCharacterParts = Array.from(characterDisplay.querySelectorAll('.character-part'))
        .filter(part => part.style.display !== 'none' && part.src);

    await Promise.all(allCharacterParts.map(loadImage));

    // Calculate the overall bounding box of *all* visible parts as they are *currently rendered* in the DOM.
    // This will determine the minimum canvas size needed to avoid clipping.
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const partsToDraw = []; // Store parts with their *DOM-rendered* positions/sizes
    if (allCharacterParts.length === 0) {
        console.error('No visible character parts to save.');
        const errorMessage = document.createElement('div');
        errorMessage.textContent = 'Failed to save character: No visible parts.';
        errorMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #f44336; color: white; padding: 10px; border-radius: 5px; z-index: 1000;';
        document.body.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 3000);
        return;
    }

    for (const part of allCharacterParts) {
        const partRect = part.getBoundingClientRect();
        // Calculate position relative to the character-display's top-left
        const x = partRect.left - displayRect.left;
        const y = partRect.top - displayRect.top;
        const width = partRect.width;
        const height = partRect.height;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);

        partsToDraw.push({ part, x, y, width, height, zIndex: parseInt(window.getComputedStyle(part).zIndex) || 0 });
    }

    // Sort parts by their z-index for correct drawing order
    partsToDraw.sort((a, b) => a.zIndex - b.zIndex);

    // Calculate the dimensions of the content's bounding box
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth <= 0 || contentHeight <= 0) {
        console.error('Calculated content bounding box is invalid:', { contentWidth, contentHeight });
        const errorMessage = document.createElement('div');
        errorMessage.textContent = 'Failed to save character: Invalid content dimensions.';
        errorMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #f44336; color: white; padding: 10px; border-radius: 5px; z-index: 1000;';
        document.body.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 3000);
        return;
    }

    // Create a new canvas element with dimensions equal to the content's bounding box
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = contentWidth;
    canvas.height = contentHeight;

    // Set background color from the character-display or a default white
    const computedDisplayStyle = window.getComputedStyle(characterDisplay);
    ctx.fillStyle = computedDisplayStyle.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each part onto the canvas, translating its position
    // so that the top-left of the overall bounding box becomes (0,0) on the canvas.
    for (const data of partsToDraw) {
        const { part, x, y, width, height } = data;
        // Draw the part at its relative position within the calculated bounding box
        ctx.drawImage(part, x - minX, y - minY, width, height);
    }

    // Convert the canvas to a JPEG data URL
    const imgData = canvas.toDataURL('image/jpeg', 0.9);

    // Create a temporary link element to trigger the download
    const a = document.createElement('a');
    a.href = imgData;
    a.download = 'character.jpeg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Initialize the character when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeCharacter);
