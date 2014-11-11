(function drawCurves() {
  let navbar = document.querySelector(".navbar");
  let navbarBorderColor = window.getComputedStyle(navbar).borderTopColor

  let c1 = document.createElement("canvas");
      c1.id = "canvas-tab-selected";
      c1.hidden = true;
      c1.width = 3 * 28;
      c1.height = 28;
  drawBackgroundTab(c1,"#FBFBFB","#EDEDED",navbarBorderColor);
  document.body.appendChild(c1);

  let c2 = document.createElement("canvas");
      c2.id = "canvas-tab-hover";
      c2.hidden = true;
      c2.width = 3 * 28;
      c2.height = 28;
  drawBackgroundTab(c2,"transparent","transparent",navbarBorderColor);
  document.body.appendChild(c2);
})();

function drawBackgroundTab(canvas,bg1,bg2,borderColor,shadowColor) {
  canvas.width = window.devicePixelRatio * canvas.width;
  canvas.height = window.devicePixelRatio * canvas.height;
  let ctx = canvas.getContext("2d");
  let r = canvas.height;
  ctx.save();
  ctx.beginPath();
  drawCurve(ctx,r);
  ctx.lineTo(3 * r, r);
  ctx.lineTo(0, r);
  ctx.closePath();
  ctx.clip();
  // draw background
  let lingrad = ctx.createLinearGradient(0,0,0,r);
  lingrad.addColorStop(0, bg1);
  lingrad.addColorStop(1, bg2);
  ctx.fillStyle = lingrad;
  ctx.fillRect(0,0,3*r,r);
  if (borderColor) {
    ctx.restore();
    ctx.beginPath();
    drawCurve(ctx,r);
    ctx.strokeStyle = borderColor;
  }
  if (shadowColor) {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
  }
  if (borderColor || shadowColor) {
    ctx.stroke();
  }
}

function drawCurve(ctx,r) {
  ctx.moveTo(r * 0, r * 0.975);
  ctx.bezierCurveTo(r * 0.27082458, r * 0.95840561,
                    r * 0.3853096, r * 0.81970962,
                    r * 0.43499998, r * 0.5625);
  ctx.bezierCurveTo(r * 0.46819998, r * 0.3905,
                    r * 0.485, r * 0.0659,
                    r * 0.95, r * 0.0);
  ctx.lineTo(r + r * 1.05, r * 0.0);
  ctx.bezierCurveTo(3 * r - r * 0.485, r * 0.0659,
                    3 * r - r * 0.46819998, r * 0.3905,
                    3 * r - r * 0.43499998, r * 0.5625);
  ctx.bezierCurveTo(3 * r - r * 0.3853096, r * 0.81970962,
                    3 * r - r * 0.27082458, r * 0.95840561,
                    3 * r - r * 0, r * 0.975);
}

