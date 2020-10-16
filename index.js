

const urlPrefix = '/url/';
const html = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>url shortener</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.8.0/css/bulma.min.css">
    <style>
        html { overflow-y: auto }
        body {
            display: flex;
            min-height: 100vh;
            flex-direction: column;
        }
        main { flex: 1 }
        footer { padding: 2rem !important; }
    </style>
</head>
<body>
<main>
    <section class="hero is-primary">
        <div class="hero-body">
            <div class="container has-text-centered">
                <h1 class="title">url shortener</h1>
                <h2 class="subtitle">access your links at konf.ovh/url/</h2>
            </div>
        </div>
    </section>
    <section class="section">
        <div class="container">
            <form class="control" id="form">
                <input class="input is-primary is-medium" type="url" name="url" placeholder="paste url here and click enter">
            </form>
        </div>
    </section>
</main>
<footer class="footer">
    <div class="content has-text-centered">
        <p><a href="mailto:pawel.gancarczyk@gmail.com">contact</a></p>
    </div>
</footer>
<script>
  window.onload = () => {
    document.getElementById('form').onsubmit = event => {
      let url = event.target.elements['url'].value;
      fetch(window.location.href, {
        method: 'POST',
        headers: { "content-type": "application/json" },
        body: JSON.stringify([url])
      })
        .then(response => response.json())
        .then(key => {
          console.log(key);
        });
      return false;
    }
  }
</script>
</body>
</html>`;

const urls = {};
load();
addEventListener('fetch', event => {event.respondWith(handleRequest(event))});

async function handleRequest(event) {
  let request = event.request;
  let response;
  switch(request.method) {
    case 'POST':
      let url;
      let json = await request.json();
      if (request.bodyUsed) {
        url = json[0];
        event.waitUntil(save(url));
      }
      if (url) response = await add(url); // TODO: url validation, search for already shortened url
      else response = new Response('expected a JSON array in the request body', { status: 422 });
      break;
    case 'GET':
      response = await get(new URL(request.url).pathname.substr(urlPrefix.length));
      break;
    default:
      response = new Response('only POST and GET methods allowed', { status: 405 });
  }
  return response;
}

async function add(url) {
  let key = Object.keys(urls).length;
  urls[key] = url;
  console.log(urls);
  return new Response(JSON.stringify([key.toString(16)]), { status: 200, headers: { "content-type": "application/json" }});
}

async function get(key) {
  if (key === "") return new Response(html, { status: 200 , headers: { "content-type": "text/html" }});
  let url = urls[parseInt(key, 16)];
  if (url) return new Response(url, { status: 200 });
  else return new Response('key not found', { status: 404 });
}

async function save(url) {
  console.log('saving url ' + url + ' to db');
}

function load() {
  console.log('loading urls from db');
}