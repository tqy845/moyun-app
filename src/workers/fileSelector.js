self.onmessage = (event) => {
    const { selectionBox, files } = event.data;
    const selectedFiles = [];

    files.forEach(file => {
        const rect = file.rect; // 假设每个文件都有一个 rect 属性
        if (
            rect.left < selectionBox.left + selectionBox.width &&
            rect.right > selectionBox.left &&
            rect.top < selectionBox.top + selectionBox.height &&
            rect.bottom > selectionBox.top
        ) {
            selectedFiles.push(file);
        }
    });

    // 将选择结果返回给主线程
    self.postMessage(selectedFiles);
}
