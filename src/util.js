const Util = {
  getWidth: () => {
    return Math.max(
      // document.body.scrollWidth,
      // document.documentElement.scrollWidth,
      // document.body.offsetWidth,
      // document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  },
  getMarginOffsets: (width) => {
    if (width < 1160) {
      return [-76, -41];
    } else if (width < 1240) {
      return [0, 0];
    } else if (width < 1460) {
      return [35, 18];
    } else if (width < 1620) {
      return [93, 48];
    } else if (width < 1820) {
      return [140, 48];
    } else {
      return [215, 85];
    }
  },
  getScale: (width) => {
    if (width < 1160) {
      return 0.8;
    } else if (width < 1240) {
      return 1;
    } else if (width < 1460) {
      return 1.1;
    } else if (width < 1620) {
      return 1.25;
    } else if (width < 1820) {
      return 1.4;
    } else if (width < 1980) {
      return 1.6;
    } else  {
      return 1.75;
    }
  }
};

module.exports = Util;
