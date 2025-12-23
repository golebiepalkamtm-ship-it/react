if (!self.define) {
  let e,
    a = {};
  const s = (s, i) => (
    (s = new URL(s + '.js', i).href),
    a[s] ||
      new Promise(a => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = s), (e.onload = a), document.head.appendChild(e));
        } else ((e = s), importScripts(s), a());
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, c) => {
    const r = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (a[r]) return;
    let n = {};
    const d = e => s(e, r),
      p = { module: { uri: r }, exports: n, require: d };
    a[r] = Promise.all(i.map(e => p[e] || d(e))).then(e => (c(...e), n));
  };
}
define(['./workbox-ebf7dac2'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: 'e1197dc7729ff875e1a1b71af9f11ec0' },
        { url: '/_next/static/chunks/172-10d98396942e57b6.js', revision: 'q2YxkTkcyxI8jlQVEh27z' },
        {
          url: '/_next/static/chunks/172-10d98396942e57b6.js.map',
          revision: 'cba7386aafd0d4628118f9f1f972e75f',
        },
        { url: '/_next/static/chunks/281-03e00ce93aefccf4.js', revision: 'q2YxkTkcyxI8jlQVEh27z' },
        {
          url: '/_next/static/chunks/281-03e00ce93aefccf4.js.map',
          revision: '758957e392999bb05572bb94d6f12fe0',
        },
        { url: '/_next/static/chunks/851-67c1dd79b2d5ab79.js', revision: 'q2YxkTkcyxI8jlQVEh27z' },
        {
          url: '/_next/static/chunks/851-67c1dd79b2d5ab79.js.map',
          revision: '76ad2c45f7bdf10576c25cee1e71f23b',
        },
        { url: '/_next/static/chunks/959-0b950847b27e1738.js', revision: 'q2YxkTkcyxI8jlQVEh27z' },
        {
          url: '/_next/static/chunks/959-0b950847b27e1738.js.map',
          revision: '579b98c96cb5b1342480c9f22d91a77f',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-fda152a4f654bb59.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-fda152a4f654bb59.js.map',
          revision: 'f9af089db1f466cca200aac229a65326',
        },
        {
          url: '/_next/static/chunks/app/about/page-35de633a381f7eae.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/about/page-35de633a381f7eae.js.map',
          revision: 'd24d779ce26d751901e476d7e52b44dd',
        },
        {
          url: '/_next/static/chunks/app/achievements/page-0189e2444367a43e.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/achievements/page-0189e2444367a43e.js.map',
          revision: '95001105cbf87752288253ddf6ebcea0',
        },
        {
          url: '/_next/static/chunks/app/admin/dashboard/page-a68207cc7baac7d3.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/admin/dashboard/page-a68207cc7baac7d3.js.map',
          revision: 'd3f3aeabe4b5e20409b2ae5a4d756ae8',
        },
        {
          url: '/_next/static/chunks/app/auctions/%5Bid%5D/page-730b823aaef38820.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/auctions/%5Bid%5D/page-730b823aaef38820.js.map',
          revision: '6db1303f99abe8a43b4641297fd379b8',
        },
        {
          url: '/_next/static/chunks/app/auctions/page-a136ea16ae377dcc.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/auctions/page-a136ea16ae377dcc.js.map',
          revision: '544618863dbb6548cf3486bc4b265f50',
        },
        {
          url: '/_next/static/chunks/app/auctions/success/page-6be75a862d625437.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/auctions/success/page-6be75a862d625437.js.map',
          revision: '0d0ba4a1186fa18198215c69bf415d2b',
        },
        {
          url: '/_next/static/chunks/app/auth/complete-profile/page-1cecc6a76fbfb862.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/auth/complete-profile/page-1cecc6a76fbfb862.js.map',
          revision: '90ec70f3c66ee2dd3c5711c23f7fea52',
        },
        {
          url: '/_next/static/chunks/app/auth/register/page-7aaced15d4072813.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/auth/register/page-7aaced15d4072813.js.map',
          revision: 'cc7b9d7675e5a1a773768c1abd5fe63f',
        },
        {
          url: '/_next/static/chunks/app/auth/reset-password/page-c4c51568c18b4112.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/auth/reset-password/page-c4c51568c18b4112.js.map',
          revision: 'f0b868d6f43cfe51fec2101ff78d3013',
        },
        {
          url: '/_next/static/chunks/app/auth/signup/page-bc9676a9438575af.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/auth/signup/page-bc9676a9438575af.js.map',
          revision: '1e5798297f4b3f95614a7e9a26a9ee07',
        },
        {
          url: '/_next/static/chunks/app/auth/verify-email/page-e330d5c28ac63aae.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/auth/verify-email/page-e330d5c28ac63aae.js.map',
          revision: 'be4e46cec32cb47cb6b327c5846abf86',
        },
        {
          url: '/_next/static/chunks/app/auth/verify-phone/page-c4b8b7d8afb56b7e.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/auth/verify-phone/page-c4b8b7d8afb56b7e.js.map',
          revision: '8e4743255319be3fe15bb9d9d0ab1177',
        },
        {
          url: '/_next/static/chunks/app/breeder-meetings/dodaj-zdjecie/page-b64a1604df777823.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/breeder-meetings/dodaj-zdjecie/page-b64a1604df777823.js.map',
          revision: '7b49c2abd561b5f4ee9d7f2b1bec0479',
        },
        {
          url: '/_next/static/chunks/app/breeder-meetings/page-a6f0c8ed91c8c570.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/breeder-meetings/page-a6f0c8ed91c8c570.js.map',
          revision: 'f465ca79f48b092ccd20b9af2a27b44d',
        },
        {
          url: '/_next/static/chunks/app/breeder-visits/page-7b508cc8b0eb0189.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/breeder-visits/page-7b508cc8b0eb0189.js.map',
          revision: '3d049b8ceee0f6790eb81a8384fb8e2b',
        },
        {
          url: '/_next/static/chunks/app/champions/%5Bid%5D/page-8a357ae23d969fc9.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/champions/%5Bid%5D/page-8a357ae23d969fc9.js.map',
          revision: 'a0032608fc3425fba75f3862efff9cfd',
        },
        {
          url: '/_next/static/chunks/app/champions/page-206feead38ef6efa.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/champions/page-206feead38ef6efa.js.map',
          revision: '2ff8b8181548d5c9f58c1c04bbff9bf7',
        },
        {
          url: '/_next/static/chunks/app/champions/zlota-para/page-1781ea6dfb8e27cf.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/champions/zlota-para/page-1781ea6dfb8e27cf.js.map',
          revision: '170113999e6e1e220264506b483571d0',
        },
        {
          url: '/_next/static/chunks/app/contact/page-2c848425398044cc.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/contact/page-2c848425398044cc.js.map',
          revision: 'd884936113a2d4e424228a5399ce9d42',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-d0445fbb682bef3b.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-d0445fbb682bef3b.js.map',
          revision: 'b54b7ff906605188f7c5a6f28039e87f',
        },
        {
          url: '/_next/static/chunks/app/global-error-e8f1b34bdb433f7c.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/global-error-e8f1b34bdb433f7c.js.map',
          revision: 'dc9fdbba07209d8862324d3c0f6c3e98',
        },
        {
          url: '/_next/static/chunks/app/layout-805b657a167e8519.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/layout-805b657a167e8519.js.map',
          revision: 'b5bb2fbb7c6c8d830e8c044c7a159765',
        },
        {
          url: '/_next/static/chunks/app/messages/page-d703a147137b1449.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/messages/page-d703a147137b1449.js.map',
          revision: '9434e75148551c20f67a01603fbb33e9',
        },
        {
          url: '/_next/static/chunks/app/page-8c747cb4211da328.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/page-8c747cb4211da328.js.map',
          revision: '9a361e759d4dd3a831f7e0e1054164ad',
        },
        {
          url: '/_next/static/chunks/app/press/page-4f8f26926df264b6.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/press/page-4f8f26926df264b6.js.map',
          revision: '21fefda0ea4ec32bae965af36ce80e46',
        },
        {
          url: '/_next/static/chunks/app/privacy/page-3a5c9180804bbb87.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/privacy/page-3a5c9180804bbb87.js.map',
          revision: '704f9af14383c72a8a731a539f172ba4',
        },
        {
          url: '/_next/static/chunks/app/profile/page-13f5baaa969afa59.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/profile/page-13f5baaa969afa59.js.map',
          revision: '9b4fee13050115b02f70aea35f2aa490',
        },
        {
          url: '/_next/static/chunks/app/references/page-2331cf2e404f506b.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/references/page-2331cf2e404f506b.js.map',
          revision: '55232bd5fc3c8f9ac46d1f06197c8cf9',
        },
        {
          url: '/_next/static/chunks/app/sales-terms/page-102ac55546664ffb.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/sales-terms/page-102ac55546664ffb.js.map',
          revision: 'df64075babef302997f52ffdbbd79b5b',
        },
        {
          url: '/_next/static/chunks/app/search/page-7f618311d22b7602.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/search/page-7f618311d22b7602.js.map',
          revision: '836da2d81f616ebeacbfce3b31947ba9',
        },
        {
          url: '/_next/static/chunks/app/seller/create-auction/page-5da0e140ca7b1b21.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/seller/create-auction/page-5da0e140ca7b1b21.js.map',
          revision: '526cfabd3897cf2a7d60356aa5d5551c',
        },
        {
          url: '/_next/static/chunks/app/sentry-example-page/page-2bcdd02b3d8b69ee.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/sentry-example-page/page-2bcdd02b3d8b69ee.js.map',
          revision: 'aea85c3f40be6e7f9eb695e2c86c1ecb',
        },
        {
          url: '/_next/static/chunks/app/terms/page-d21aa7bd46c7d0ce.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/terms/page-d21aa7bd46c7d0ce.js.map',
          revision: 'b615f8bd793c1e9276ce795872c5c89c',
        },
        {
          url: '/_next/static/chunks/app/user/create-auction/page-45ca62b07bfad143.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/app/user/create-auction/page-45ca62b07bfad143.js.map',
          revision: '54dfa6fb88dd6b613059f6b1d15ef900',
        },
        {
          url: '/_next/static/chunks/main-app-07e2c5a28a44308a.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/main-app-07e2c5a28a44308a.js.map',
          revision: 'daeb948e429df3cc1eab3a5e0beb7f7e',
        },
        { url: '/_next/static/chunks/main-f48e1eb4fd38b27a.js', revision: 'q2YxkTkcyxI8jlQVEh27z' },
        {
          url: '/_next/static/chunks/pages/_app-f8513480a346ac67.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/pages/_app-f8513480a346ac67.js.map',
          revision: 'a81aa569ccb227f50d93d3a183304235',
        },
        {
          url: '/_next/static/chunks/pages/_error-3563fd927cf86848.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/pages/_error-3563fd927cf86848.js.map',
          revision: 'a61148dc908085821b32af85aa142a62',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        { url: '/_next/static/chunks/ui-44e7f9062d4ca022.js', revision: 'q2YxkTkcyxI8jlQVEh27z' },
        {
          url: '/_next/static/chunks/ui-44e7f9062d4ca022.js.map',
          revision: '515ca2e58e6ad20fa46f2d28ad721618',
        },
        {
          url: '/_next/static/chunks/webpack-075db3cb66a5304e.js',
          revision: 'q2YxkTkcyxI8jlQVEh27z',
        },
        {
          url: '/_next/static/chunks/webpack-075db3cb66a5304e.js.map',
          revision: '85a5b0aa6a615a7afd9899cab7cd9d8b',
        },
        { url: '/_next/static/css/a11fd4c7bc683bfa.css', revision: 'a11fd4c7bc683bfa' },
        {
          url: '/_next/static/css/a11fd4c7bc683bfa.css.map',
          revision: '8cb4859eb16cae454be9c706bd22dd15',
        },
        { url: '/_next/static/css/e97844793b43dde4.css', revision: 'e97844793b43dde4' },
        {
          url: '/_next/static/css/e97844793b43dde4.css.map',
          revision: '00d4bf8093402ee808625470c8d141d2',
        },
        {
          url: '/_next/static/q2YxkTkcyxI8jlQVEh27z/_buildManifest.js',
          revision: '7ae051e49d82dbdd642a1813e1767e08',
        },
        {
          url: '/_next/static/q2YxkTkcyxI8jlQVEh27z/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        // Removed apple-touch-icon.png - using logo.png instead
        { url: '/aukcje.png', revision: '87e9ddfb6c5851ba3fb88b94397ab071' },
        { url: '/champions/1/data.json', revision: 'cebcd5cbcc59074087a37e931e3873f0' },
        {
          url: '/champions/1/gallery/DV-02906-11-98t_OLIMP (1).jpg',
          revision: '85550199e23014bdcb595bbf774fad1e',
        },
        {
          url: '/champions/1/pedigree/DV-02906-11-98.1.jpg',
          revision: '312544a17b042000ada068995801d386',
        },
        {
          url: '/champions/10/gallery/pl-0446-15-4181_c.jpg',
          revision: 'bff1b0f1b194b091347c710d24bc8109',
        },
        {
          url: '/champions/10/pedigree/PL-0446-15-4181.1.jpg',
          revision: 'd74f5a3d79a6b0f7f919721d3b2a3ed6',
        },
        {
          url: '/champions/11/gallery/pl-0446-14-7012_c.jpg',
          revision: '147452c2c2dda66fb14b6e06388cb953',
        },
        {
          url: '/champions/11/pedigree/PL-0446-14-7012.1.jpg',
          revision: 'cff9ac561e1d15fd5195532552d58533',
        },
        {
          url: '/champions/12/gallery/pl-0446-14-7152_c.jpg',
          revision: '20abf5dde468bd271dc0524636c1b1f5',
        },
        {
          url: '/champions/12/pedigree/PL-0446-14-7152.1.jpg',
          revision: '11fc8fe73372dab3a4e3afd8bad4da05',
        },
        {
          url: '/champions/13/gallery/pl-0446-14-7202_c.jpg',
          revision: 'c6f68f9eb7c1704114f1e27c3f8ccc1d',
        },
        {
          url: '/champions/13/pedigree/PL-0446-14-7202.1.jpg',
          revision: '62fca95eb3597a158e7a41452259ad5e',
        },
        {
          url: '/champions/14/gallery/pl-0446-14-7158_c.jpg',
          revision: 'd874c22a1a8a4eedb80888704112da02',
        },
        {
          url: '/champions/14/pedigree/PL-0446-14-7158.1.jpg',
          revision: '6124c467885e99a7d29e370afa25a12c',
        },
        {
          url: '/champions/15/gallery/pl-0446-16-2255_c.jpg',
          revision: '68426f49db70fbb6b514be2d605add49',
        },
        {
          url: '/champions/15/pedigree/PL-0446-16-2255.1.jpg',
          revision: '8e2f8e272e059cd3a38a06f66a944643',
        },
        {
          url: '/champions/16/gallery/pl-0446-16-1124_h.jpg',
          revision: '7781b4022619db84f25bfa4e3b134898',
        },
        {
          url: '/champions/16/pedigree/PL-0446-16-1124.1.jpg',
          revision: '37f9d8485a6557f1e767584d9dc33289',
        },
        { url: '/champions/2/data.json', revision: 'f7d6396209b21e9cd8987a9351bb23e6' },
        {
          url: '/champions/2/gallery/dv-0987-11-396_c.jpg',
          revision: '8da866b9ef3460b095f321737fcf6e7a',
        },
        {
          url: '/champions/2/pedigree/DV-00987-11-396.1.jpg',
          revision: '12adc271e6b8db42649e9f8ee6b7b676',
        },
        { url: '/champions/3/data.json', revision: 'fc0d1d77ab92b2da2612a8d2b58094f0' },
        {
          url: '/champions/3/gallery/dv-07136-10-202_c.jpg',
          revision: '53cdcddaf7977192c291b3b29101089d',
        },
        {
          url: '/champions/3/pedigree/DV-07136-10-202.1.jpg',
          revision: 'd735b8142186ce869606892a1f7cb611',
        },
        { url: '/champions/4/data.json', revision: 'f41c53a8e6a05a40cfe31ca8a1f4e583' },
        {
          url: '/champions/4/gallery/PL-11-160651t_b2 (1).jpg',
          revision: 'f5f8782ad3edec41e98576f44cda756a',
        },
        {
          url: '/champions/4/pedigree/PL-11-160651.1.jpg',
          revision: '6ae24bea610f569fae311c16535321e4',
        },
        { url: '/champions/5/data.json', revision: '8df85b4026555a1b12c50b3e451400d5' },
        {
          url: '/champions/5/gallery/PL-0446-12-328_2KK.jpg',
          revision: 'f6d56f273d8cc6f164f8b973d3d6f918',
        },
        {
          url: '/champions/5/pedigree/PL-0446-12-328.1.jpg',
          revision: '154b28acb4678d7078f5fc8bf9588bc4',
        },
        {
          url: '/champions/6/gallery/pl-0446-12-1016_c.jpg',
          revision: '56c3752f50585951fec3aecfd22e226f',
        },
        {
          url: '/champions/6/pedigree/PL-0446-12-1016.1.jpg',
          revision: '8abd97f3fb3b8b8f0dd428ea4c502d3f',
        },
        {
          url: '/champions/7/gallery/pl-0446-12-1046_c.jpg',
          revision: 'f0a6dbdedf8eee7f24c1ffe01ba13e97',
        },
        {
          url: '/champions/7/pedigree/PL-0446-12-1046.1.jpg',
          revision: 'baa8ff95a2ef6301fafc5bbc11b7ba23',
        },
        {
          url: '/champions/8/gallery/PL-0446-13-5015.jpg',
          revision: 'e01b4e07e60736b29975a7598a1c1ad2',
        },
        {
          url: '/champions/8/pedigree/PL-0446-13-5015.1.jpg',
          revision: '5358e7a5e1bee975b47e9de5b24a941f',
        },
        {
          url: '/champions/9/gallery/PL-0446-13-5071_KK-OLIMP.jpg',
          revision: '5dd1a3f5952462b417b9207483b0aec0',
        },
        {
          url: '/champions/9/pedigree/PL-0446-13-5071.1.jpg',
          revision: '263d0e6056759b575c03138bc13466f0',
        },
        { url: '/champions/README.md', revision: '4f4bdf0e600396617c35b5f1cdfc2d6b' },
        { url: '/favicon.ico', revision: 'd386e5086aded801abc8caa8015e86e4' },
        { url: '/golden-pair/README.md', revision: '7b0892ae219479995d7e91d379a6a069' },
        {
          url: '/golden-pair/photos/DV-02906-00-1360-D.jpg',
          revision: '85d2468f883b655cdc5153ab79e28f6d',
        },
        {
          url: '/golden-pair/photos/DV-0987-05-1184-D.jpg',
          revision: '8622c8932262200c9c0c6336e1522fcc',
        },
        {
          url: '/golden-pair/photos/golden-pair.jpg',
          revision: 'c367424828c02d98dcbd28771a7bbca6',
        },
        { url: '/logo-backup.png', revision: 'd386e5086aded801abc8caa8015e86e4' },
        { url: '/logo.png', revision: 'd386e5086aded801abc8caa8015e86e4' },
        { url: '/logo.xcf', revision: 'a20a10a46eb8b75cf34f4b19fa84065b' },
        { url: '/manifest.json', revision: '476f90929caf20a398aac4090e24a835' },
        {
          url: '/meetings with breeders/Geert Munnik/DSC_0031.jpg',
          revision: 'ecd9ad70a2e0719562f98e6c006d2929',
        },
        {
          url: '/meetings with breeders/Geert Munnik/DSC_0038.jpg',
          revision: '38dee213dee24faaeeb3633ce799deb6',
        },
        {
          url: '/meetings with breeders/Geert Munnik/DSC_0044.jpg',
          revision: 'd7f2ea447e28296e8a2de4ebd03ff939',
        },
        {
          url: '/meetings with breeders/Geert Munnik/DSC_0399.jpg',
          revision: '86888b1d927f15142ffab4e1332ed13f',
        },
        {
          url: '/meetings with breeders/Geert Munnik/DSC_03991.jpg',
          revision: '86888b1d927f15142ffab4e1332ed13f',
        },
        {
          url: '/meetings with breeders/Geert Munnik/DSC_0409.jpg',
          revision: 'c9b2d76a2c994218365bbe6a9eb656fd',
        },
        {
          url: '/meetings with breeders/Jan Oost/DSC_0002.jpg',
          revision: '82fdcf24d238db40fb61a7b2bba81e31',
        },
        {
          url: '/meetings with breeders/Jan Oost/DSC_0004.jpg',
          revision: '0f0b894029e49a99f4087282dde28bc0',
        },
        {
          url: '/meetings with breeders/Jan Oost/DSC_0006.jpg',
          revision: 'cf118c10f19ae6c8e1fff7ec8df92665',
        },
        {
          url: '/meetings with breeders/Jan Oost/DSC_0011.jpg',
          revision: '64c38e4425563040a60190d9b18ab669',
        },
        {
          url: '/meetings with breeders/Jan Oost/DSC_0017.jpg',
          revision: '0f729308ee7c0c7c323ebc119617f804',
        },
        {
          url: '/meetings with breeders/Jan Oost/DSC_0018.jpg',
          revision: '1768ad5b507ff367aa2d3d4490964685',
        },
        {
          url: '/meetings with breeders/Jan Oost/DSC_0422.jpg',
          revision: 'c276d97ca5afced1aefb629cf3859f6c',
        },
        {
          url: '/meetings with breeders/Jan Oost/DSC_0423.jpg',
          revision: 'f7e8a74aaa3df43f2db1ebca5378db78',
        },
        {
          url: '/meetings with breeders/Jan Oost/DSC_0426.jpg',
          revision: '161a2bc4ddea4277c66548ffc4cc521d',
        },
        {
          url: '/meetings with breeders/Marginus Oostenbrink/DSC_0431.jpg',
          revision: 'cf1068245adb937de74e4a866197024b',
        },
        {
          url: '/meetings with breeders/Marginus Oostenbrink/DSC_0433.jpg',
          revision: 'f12cb95d3c8757140e477a40150b7a9b',
        },
        {
          url: '/meetings with breeders/Marginus Oostenbrink/DSC_0435.jpg',
          revision: '428558b3ca45ab99c3464b57b88b1b87',
        },
        {
          url: '/meetings with breeders/Theo Lehnen/Theo-1.jpg',
          revision: 'ba6a524217d0dd1a6cf4baaa0bbf1009',
        },
        {
          url: '/meetings with breeders/Theo Lehnen/Theo-2.jpg',
          revision: '6360a9e6a53356d2ffab25768f203b91',
        },
        {
          url: '/meetings with breeders/Theo Lehnen/Theo-3.jpg',
          revision: 'bd1bdef7fa42a1993b5ffe54829381b1',
        },
        {
          url: '/meetings with breeders/Theo Lehnen/Theo.jpg',
          revision: '5976d6287ad1eca7d63dfe06682d9576',
        },
        {
          url: '/meetings with breeders/Toni van Ravenstein/DSCF2556.jpg',
          revision: '8a3cb7425440409ff1c2105d687eb6f1',
        },
        {
          url: '/meetings with breeders/Toni van Ravenstein/DSCF2559.jpg',
          revision: '8c62a60f74d9d8aabe16979c6e827a8c',
        },
        {
          url: '/meetings with breeders/Toni van Ravenstein/DSCF2578.jpg',
          revision: '98f3dcd512b2ea8e60b3583613fbcced',
        },
        {
          url: '/meetings with breeders/Toni van Ravenstein/DSC_0001.jpg',
          revision: '0d24987926a768e1b5c92bc4a2929cd9',
        },
        {
          url: '/meetings with breeders/Toni van Ravenstein/DSC_0003.jpg',
          revision: '6a63e642975e91b1d877bfdfc1621bf2',
        },
        {
          url: '/meetings with breeders/Toni van Ravenstein/TONI-1.jpg',
          revision: '33248b7348012f1039e5399337dfb411',
        },
        {
          url: '/meetings with breeders/Toni van Ravenstein/TONI-2.jpg',
          revision: '8ea554c94953cc9566a7a0f88c2010dc',
        },
        {
          url: '/models/cf3eab1f-c4c2-43fc-9a8d-0583cf824574.glb',
          revision: 'e934be18cf4fc0d1c773c4a2a17602d2',
        },
        { url: '/offline.html', revision: 'b270b37ee201f4636ce9d36ce641d296' },
        { url: '/pigeon-lofts-background.jpg', revision: '34e291cfa562ff17f0397b2f98cb51fb' },
        { url: '/pigeon.gif', revision: 'e1219f51bc47e9158ceb5d7ff46d9f4d' },
        {
          url: '/press/articles/older/1/dobry-lot-11.jpg',
          revision: 'd52e1ac9889944e282a819e70f79ffef',
        },
        {
          url: '/press/articles/older/1/dobry-lot-21.jpg',
          revision: '20e1c58f80fc1d566bdf429e4b57941c',
        },
        {
          url: '/press/articles/older/1/dobry-lot-31.jpg',
          revision: '0893303aee4d438d3007e615e1ba0ecd',
        },
        {
          url: '/press/articles/older/1/dobry-lot-41.jpg',
          revision: 'a9d7eb3e2e5f6443448d3d948604e1e4',
        },
        {
          url: '/press/articles/older/1/dobry-lot.jpg',
          revision: '4867b6fecae5cc83664651bde8352c31',
        },
        {
          url: '/press/articles/older/2/Hodowca-1-001.jpg',
          revision: 'fae14b74e187911571d37dab4bb1d389',
        },
        {
          url: '/press/articles/older/2/Hodowca-2-001.jpg',
          revision: 'e1116f57763623b1ac68ea4d02ce6aaf',
        },
        {
          url: '/press/articles/older/2/Hodowca-3-001.jpg',
          revision: '47298db3d6d3cbdba7424bac6d52d0cd',
        },
        {
          url: '/press/articles/older/2/Hodowca.jpg',
          revision: 'a01971f8273465ee5cd3f75024b3e766',
        },
        {
          url: '/press/articles/older/3/Newspapers-1-708x1024.jpg',
          revision: '897587e26aae8213cc59970ddb5a816c',
        },
        {
          url: '/press/articles/older/3/Newspapers-1.jpg',
          revision: '27042283255e4360dd67e9c477053cb5',
        },
        {
          url: '/press/articles/older/3/Newspapers-2.jpg',
          revision: '82e6d3e0bb3c7e41bccef9a2ea94fdf8',
        },
        {
          url: '/press/articles/older/3/Newspapers-3.jpg',
          revision: 'fbe04ce54a269d2c8fa8d26ba5efe462',
        },
        {
          url: '/press/articles/older/3/Newspapers.jpg',
          revision: '0caedab8655e2d1e85358feec08e1b71',
        },
        {
          url: '/press/articles/older/4/Hodowca20142s (1).jpg',
          revision: '1406e32ccf227f5389065688eef31de8',
        },
        {
          url: '/press/articles/older/4/Hodowca20143s.jpg',
          revision: '350f8afce530db3d1768d0cadbaf5b7d',
        },
        {
          url: '/press/articles/older/4/Hodowca20144s.jpg',
          revision: 'f892cd0be2bcc004bf928bf0c1a29a89',
        },
        {
          url: '/press/articles/older/4/Hodowca2014m.jpg',
          revision: '9599adb7cfa5fa5f17c44eca6d0f66d7',
        },
        {
          url: '/press/articles/older/movie-cover.jpg',
          revision: 'd21d34300d40585d1f0ea034bf8f044e',
        },
        {
          url: '/uploads/document/548250538_1492141408641102_3627011869622723222_n_1759309947911_2l5tgf.jpg',
          revision: '326af5bca501001ebe144e961e189830',
        },
        {
          url: '/uploads/document/548250538_1492141408641102_3627011869622723222_n_1759388886741_wpv5ju.jpg',
          revision: '326af5bca501001ebe144e961e189830',
        },
        {
          url: '/uploads/document/548250538_1492141408641102_3627011869622723222_n_1759482744581_10f26w.jpg',
          revision: '326af5bca501001ebe144e961e189830',
        },
        {
          url: '/uploads/document/548250538_1492141408641102_3627011869622723222_n_1759482812505_srh4tl.jpg',
          revision: '326af5bca501001ebe144e961e189830',
        },
        {
          url: '/uploads/document/548250538_1492141408641102_3627011869622723222_n_1759482879342_uh8alb.jpg',
          revision: '326af5bca501001ebe144e961e189830',
        },
        {
          url: '/uploads/document/548250538_1492141408641102_3627011869622723222_n_1759482943055_sde8lv.jpg',
          revision: '326af5bca501001ebe144e961e189830',
        },
        {
          url: '/uploads/document/548250538_1492141408641102_3627011869622723222_n_1759484129154_au6uce.jpg',
          revision: '326af5bca501001ebe144e961e189830',
        },
        {
          url: '/uploads/document/548250538_1492141408641102_3627011869622723222_n_1759484197858_h9ehg0.jpg',
          revision: '326af5bca501001ebe144e961e189830',
        },
        {
          url: '/uploads/document/548250538_1492141408641102_3627011869622723222_n_1759484790836_213ts7.jpg',
          revision: '326af5bca501001ebe144e961e189830',
        },
        {
          url: '/uploads/image/1360_1759484790773_va6m6q.jpg',
          revision: '4abee1ade2e9ba8d996bcf078868c2d4',
        },
        {
          url: '/uploads/image/1726_1759309768894_a7b6bu.jpg',
          revision: '93031f5a28d97f0e824d42bd0d52559b',
        },
        {
          url: '/uploads/image/1726_1759309947848_zx35km.jpg',
          revision: '93031f5a28d97f0e824d42bd0d52559b',
        },
        {
          url: '/uploads/image/1726_1759388886689_kdiya7.jpg',
          revision: '93031f5a28d97f0e824d42bd0d52559b',
        },
        {
          url: '/uploads/image/1726_1759482744512_0i06yz.jpg',
          revision: '93031f5a28d97f0e824d42bd0d52559b',
        },
        {
          url: '/uploads/image/1726_1759482812445_9vhtvt.jpg',
          revision: '93031f5a28d97f0e824d42bd0d52559b',
        },
        {
          url: '/uploads/image/1726_1759482879287_6w65wq.jpg',
          revision: '93031f5a28d97f0e824d42bd0d52559b',
        },
        {
          url: '/uploads/image/1726_1759482942999_42rixh.jpg',
          revision: '93031f5a28d97f0e824d42bd0d52559b',
        },
        {
          url: '/uploads/image/1726_1759484129103_liemt6.jpg',
          revision: '93031f5a28d97f0e824d42bd0d52559b',
        },
        {
          url: '/uploads/image/1726_1759484197795_5771kh.jpg',
          revision: '93031f5a28d97f0e824d42bd0d52559b',
        },
        {
          url: '/uploads/image/dv_02906_99_1726oko_c_1__1759486096696_d2g3k1.png',
          revision: '949c2f8c07d35ea0e03ed4ab4782afba',
        },
        { url: '/uploads/image/test-auction.png', revision: 'b357a19c87624c7c4d131aeeb4ae677f' },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: a, event: s, state: i }) =>
              a && 'opaqueredirect' === a.type
                ? new Response(a.body, { status: 200, statusText: 'OK', headers: a.headers })
                : a,
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      new e.CacheFirst({ cacheName: 'google-fonts', plugins: [] }),
      'GET',
    ),
    e.registerRoute(
      /^\/_next\/image\?/,
      new e.StaleWhileRevalidate({ cacheName: 'next-image', plugins: [] }),
      'GET',
    ),
    e.registerRoute(
      /^\/api\/.*$/i,
      new e.NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        plugins: [new e.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 3600 })],
      }),
      'GET',
    ));
});
//# sourceMappingURL=sw.js.map
