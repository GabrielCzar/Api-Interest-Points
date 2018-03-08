$('select.dropdown').dropdown();
$('.ui.sidebar').sidebar('toggle');

var cities = new Vue({
  el: '#cities',
  data: {
    cities: []
  }, 
  mounted() {
    this.get()
  },
  methods: {
    get: function () {
      fetch('/scrape-cities').then((res) => {
        res.json().then((data) => {
          this.cities = data
        });
      });
    }
  }
});
 
var message = new Vue({
  el: '#message',
  data: {
    hidden: true,
    url: '/ilat/39.68/ilon/116.08/flat/40.18/flon/116.77/city/Beijing.json',
    city: 'Beijing'
  },
  methods: {
    copy: function () {
      let link = document.getElementById('url');
      let range = document.createRange();
      range.selectNode(link);
      window.getSelection().addRange(range);
      document.execCommand('Copy');
      // Show feedback to user
      let btnCopy = document.getElementById('btnCopy');
      btnCopy.setAttribute('data-tooltip', 'URL Copiada com sucesso!');
      setTimeout(() => {
        btnCopy.removeAttribute('data-tooltip');
      }, 1000);
    }
   }
 });

let search = new Vue({
  el: '#search',
  methods: {
    submit: function (e) {
      let cityChoosed = document.getElementById('cities').value

      if (cityChoosed === '' || cityChoosed === 'undefined') 
      	return false;
      // get coordinates
      fetch(`/scrape-location/${cityChoosed}`).then((res) => {
        res.json().then((coords) => {
          let ilat = coords[0], 
              ilon = coords[1], 
              flat = coords[2], 
              flon = coords[3];
          // create url to find data
          const URL = `/ilat/${ilat}/ilon/${ilon}/flat/${flat}/flon/${flon}/city/${cityChoosed}-interest-points.json`;
          // set data
          message.city = cityChoosed;
          message.url = URL;
          message.hidden = false;
          })
        });
      e.preventDefault();
    }
  }
});


