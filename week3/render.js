const images = require("images");

function render(viewport, element) {
  if (element.style) {
    var img = images(element.style.width, element.style.height);

    if (element.style["background-color"]) {
      let color = element.style["background-color"] || "rgb(0,0,0)";
      let found = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
      // console.log("render -> found", found);
      console.log(
        "\n\n----\nrender -> element.style width=",
        element.style.width,
        " height=",
        element.style.height,
        "element.style.top=",
        element.style.top,
        "element.style.left=",
        element.style.left,
        "found 1,2,3=",
        found[1],
        found[2],
        found[3]
      );
      img.fill(Number(found[1]), Number(found[2]), Number(found[3]));
      viewport.draw(img, element.style.left || 0, element.style.top || 0);
    }
  }

  if (element.children) {
    for (let child of element.children) {
      render(viewport, child);
    }
  }
}

module.exports = render;
