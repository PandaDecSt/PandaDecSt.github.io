function getImgPartdata(canvas, img, fromX, fromY, toX, toY) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, fromX, fromX, toX - fromX, toY - fromY, 0, 0, toX - fromX, toY - fromY);
    var result = ctx.getImageData(0, 0, toX - fromX, toY - fromY);
    //ctx.putImageData(beifen, 0, 0);
    return result;
}
