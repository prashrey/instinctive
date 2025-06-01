const fs = require('fs');
const path = require('path');

const itemsPath = path.join(process.cwd(), 'items.json');
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

function getImageUrl(item) {
    const name = item.name.toLowerCase().replace(/[^a-z0-9]/g, ',');
    const category = item.facets.category.toLowerCase();
    return `https://source.unsplash.com/400x400/?${name},${category}`;
}

const updatedItems = items.map(item => ({
    ...item,
    imgUrl: getImageUrl(item)
}));

fs.writeFileSync(itemsPath, JSON.stringify(updatedItems, null, 2), 'utf8');
console.log('Successfully updated items with image URLs');
