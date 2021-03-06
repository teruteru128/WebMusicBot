/* global $, io */

const guild = $('#id').val()
const socket = io.connect()

console.log('socket', 'emit', 'init', guild)
socket.emit('init', guild)

socket.on('connect', () => {
  console.log('socket', 'connect')
  $('#loading').addClass('completed')
})

$('#search').submit(() => {
  console.log('socket', 'emit', 'q', $('#q').val())
  socket.emit('q', $('#q').val())
  return false
})

socket.on('list', data => {
  console.log('socket', 'on', 'list', data)
  $('#list').empty()
  if (!Array.isArray(data)) return
  for (const item of data) {
    $('#list').append(videoEle({
      img: item.img,
      title: item.title,
    }))
  }
})

socket.on('result', data => {
  console.log('socket', 'on', 'result', data)
  $('#results').empty()
  for (const item of data.items) {
    $('#results').append(videoEle({
      img: item.snippet.thumbnails.medium.url,
      title: item.snippet.title,
      id: item.id.videoId,
      channel: item.snippet.channelTitle,
    }))
  }
})

socket.on('error', error => {
  console.log('socket', 'on', 'error', error)
  $('.error').show().text(error).delay(3000).fadeOut()
})

$(document).on('click', '#add', function() {
  const target = $(this).parents('li')
  const data = {
    id: target.data('video-id'),
    img: target.find('img').attr('src'),
    title: target.find('h5').text(),
    guild: guild,
  }
  console.log('socket', 'emit', 'add', data)
  socket.emit('add', data)
})

$(document).on('click', '#remove', function() {
  const data = {
    index: $('#list>li').index($(this).parent()),
    id: guild,
  }
  console.log('socket', 'emit', 'remove', data)
  socket.emit('remove', data)
})

$('#volume').slider({
  formatter: value => parseInt(value / 2) + '%',
}).on('slide', function() {
  const data = { volume: $(this).val(), id: guild }
  console.log('socket', 'emit', 'volume', data)
  socket.emit('volume', data)
})

socket.on('volume', volume => {
  console.log('socket', 'on', 'volume', volume)
  $('#volume').slider('setValue', volume)
})

function videoEle(params) {
  let ele = null
  if (params.id) {
    // 検索結果
    ele = `
      <li class="list-group-item movie text-left" data-video-id="${params.id}">
        <div class="row">
          <div class="col-2">
            <img class="rounded img-fluid" src="${params.img}" alt="${params.title}">
          </div>
          <div class="col-9">
            <h5>${params.title}</h5>
            <small>by ${params.channel}</small>
          </div>
          <div class="col-1">
            <button type="button" class="btn btn-primary float-right" id="add">
              <i class="fa fa-plus" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </li>`
  } else {
    // キュー
    ele = `
      <li class="list-group-item movie text-left">
        <div class="row">
          <div class="col-3">
            <img class="rounded img-fluid" src="${params.img}" alt="${params.title}">
          </div>
          <div class="col-8">
            <h5>${params.title}</h5>
          </div>
          <div class="col-1">
            <button type="button" class="btn btn-primary float-right" id="remove">
              <i class="fa fa-times" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </li>`
  }
  return ele
}
