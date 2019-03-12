//Start websocker at localhost:8000/dockcontrol
var socket = new WebSocket("ws://localhost:8000/dockcontrol");
//Ask server to send the information about existing containers and images
socket.onopen = function() {
  socket.send("Info");
};

// socket.onclose = function(event) {
//   if (event.wasClean) {
//     alert('Соединение закрыто чисто');
//   } else {
//     alert('Обрыв соединения');
//   }
//   alert('Код: ' + event.code + ' причина: ' + event.reason);
// };

socket.onmessage = function(event) {
  //Refresh the information on the page
  var container_title = document.createElement("li");
  container_title.className = "list-group-item bg-info";
  container_title.innerText = "Running Containers";

  var image_title = document.createElement("li");
  image_title.className = "list-group-item bg-info";
  image_title.innerText = "Images list";

  var par = JSON.parse(event.data)

  var ul_images = document.getElementById("ul-images");
  var ul_containers = document.getElementById("ul-containers");
  $(ul_images).children().remove();
  $(ul_containers).children().remove();
  ul_images.appendChild(image_title);
  ul_containers.appendChild(container_title);
  if (par.includes("Invalid request")){
    alert(par);
  }
  else{
    //Parse data to isolate the information about images from information about containers
    for (p in par){
      //Create the image element with button "Run"
      if (par[p]["name"] == "image"){
        var li = document.createElement('li');
        li.setAttribute("class", "list-group-item");
        li.id = par[p]["inner"]["image_name"];
        li.innerText = par[p]["inner"]["image_name"];

        var p = document.createElement('p');
        p.setAttribute("class", "mt-2");

        var buttonRun = document.createElement('button');
        buttonRun.setAttribute("class", "btn btn-success");
        buttonRun.setAttribute("type", "button");
        buttonRun.setAttribute("value", "Run");
        buttonRun.setAttribute("name", "Run");
        buttonRun.setAttribute("onclick", "container_docker('" + li.id + "')");
        buttonRun.innerText = "Run";

        p.appendChild(buttonRun);
        li.appendChild(p);
        ul_images.appendChild(li);
      }
      // else if (par[p]["name"] == "listening_port") {
      //   alert("port " + par[p]["port"]);
      // }
      else if (par[p]["name"] == "container"){
        //Create the container element with buttons "Stop" and "Delete"
        //if the container's working
        if (par[p]["inner"]["status"] == "up" || par[p]["inner"]["status"] == "running"){
          var li = document.createElement('li');
          li.setAttribute("class", "list-group-item");
          li.id = par[p]["inner"]["container_name"];
          li.innerText = par[p]["inner"]["container_name"];

          var p = document.createElement('p');
          p.setAttribute("class", "mt-2");

          var buttonStop = document.createElement('button');
          buttonStop.setAttribute("class", "btn btn-warning");
          buttonStop.setAttribute("type", "button");
          buttonStop.setAttribute("value", "Stop");
          buttonStop.setAttribute("name", "Stop");
          buttonStop.setAttribute("onclick", "stop_docker('" + li.id + "')");
          buttonStop.innerText = "Stop";

          var buttonDelete = document.createElement('button');
          buttonDelete.setAttribute("class", "btn btn-danger ml-1");
          buttonDelete.setAttribute("type", "button");
          buttonDelete.setAttribute("value", "Delete");
          buttonDelete.setAttribute("name", "Delete");
          buttonDelete.setAttribute("onclick", "delete_docker('" + li.id + "')");
          buttonDelete.innerText = "Delete";

          p.appendChild(buttonStop);
          p.appendChild(buttonDelete);
          li.appendChild(p);
          ul_containers.appendChild(li);
        }
        //Create the container element with buttons "Start" and "Delete"
        //if the container's stopped
        else {
          var li = document.createElement('li');
          li.setAttribute("class", "list-group-item");
          li.id = par[p]["inner"]["container_name"];
          li.innerText = par[p]["inner"]["container_name"];

          var p = document.createElement('p');
          p.setAttribute("class", "mt-2");

          var buttonStart = document.createElement('button');
          buttonStart.setAttribute("class", "btn btn-success");
          buttonStart.setAttribute("type", "button");
          buttonStart.setAttribute("value", "Start");
          buttonStart.setAttribute("name", "Start");
          buttonStart.setAttribute("onclick", "start_docker('" + li.id + "')");
          buttonStart.innerText = "Start";

          var buttonDelete = document.createElement('button');
          buttonDelete.setAttribute("class", "btn btn-danger ml-1");
          buttonDelete.setAttribute("type", "button");
          buttonDelete.setAttribute("value", "Delete");
          buttonDelete.setAttribute("name", "Delete");
          buttonDelete.setAttribute("onclick", "delete_docker('" + li.id + "')");
          buttonDelete.innerText = "Delete";

          p.appendChild(buttonStart);
          p.appendChild(buttonDelete);
          li.appendChild(p);
          ul_containers.appendChild(li);
        }
      };
    }
  }
  //Show client corresponding information if there are no images on server
  if ($(ul_images).children().length == 1){
    var li_image = document.createElement("li");
    li_image.className = "list-group-item";
    li_image.innerText = "There are no available images";
    ul_images.appendChild(li_image);
  }

  //Show client corresponding information if there are no containers on server
  if ($(ul_containers).children().length == 1){
    var li_container = document.createElement("li");
    li_container.className = "list-group-item";
    li_container.innerText = "There are no running containers";
    ul_containers.appendChild(li_container);
  }
};

socket.onerror = function(error) {
  alert("Ошибка " + error.message);
};

//Sends the request to server to Run the container within image with name "image"
function container_docker(image){
  socket.send(image + " Run");
};

//Sends the request to delete to Start the container with name "name"
function start_docker(name){
  socket.send(name + " Start");
};

//Sends the request to delete to Stop the container with name "name"
function stop_docker(name){
  socket.send(name + " Stop");
};

//Sends the request to delete to Remove the container with name "name"
function delete_docker(name){
  socket.send(name + " Delete");
};
