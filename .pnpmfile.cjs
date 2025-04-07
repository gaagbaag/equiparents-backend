// .pnpmfile.cjs
module.exports = {
  hooks: {
    readPackage(pkg) {
      // Scripts aprobados automáticamente
      const approved = [
        "@prisma/client",
        "@prisma/engines",
        "prisma",
        "esbuild",
      ];

      if (approved.includes(pkg.name)) {
        pkg.scripts = {};
      }

      return pkg;
    },
  },
};
