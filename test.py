from sanic import Sanic
import sanic
import json
import docker

client = docker.from_env(version='auto')

#Removes existing container by its name
def delete_container(name):
    container = client.containers.get(name)
    container.stop()
    container.remove()
    return get_info()

#Stops running container by its name
def stop_container(name):
    container = client.containers.get(name)
    container.stop()
    return get_info()

#Starts existing container, for instance : with status "Exited"
def start_container(name):
    client.api.start(name)
    return get_info()

#Runs a container inside chosen image
def run_container(image):
    client.containers.run(image, detach=True)
    return get_info()

#Returns the names of existing containers and their statuses
def get_containers_info():
    res = []
    for container in client.containers.list(all=True):
        var_dict_cont = {
            "container_name" : str(container.name) + ' : ' + str(container.image).split(":")[1][2:] ,
            "status" : container.status ,
        }
        var_dict = {
            "name" : "container",
            "inner" : var_dict_cont,
        }
        res.append(var_dict)
    return res

#Returns the names of existing images
def get_images_info():
    res = []
    for image in set(client.images.list()):
        var_dict_image = {
            "image_name" : str(image).split(':')[1][2:] ,
        }
        var_dict = {
            "name" : "image",
            "inner" : var_dict_image
        }
        res.append(var_dict)
    return res

#Returns the names of existing images and the names of existing containers
#with their statuses
def get_info():
    conts = get_containers_info()
    ims = get_images_info()
    return  conts + ims


app = Sanic()

#Start websocket at localhost:8000/dockcontrol
@app.websocket("/dockcontrol")
async def docker_control(request, ws):
    #Send the information about existing containers and images to client with JSON
    await ws.send(json.dumps(get_containers_info()))
    #Listening for client's messages in while loop
    while True:
        #Receive the message
        data = await ws.recv()
        '''
        We got a list of possible commands:
        1) "Info" - returns the information about existing images and containers
        2) "Run image_name" - runs a container within the image with
            the name "image_name"
        3) "Delete container_name" - removes a container with the name "container_name"
        4) "Stop container_name" - stops a container with the name "container_name"
        5) "Start container_name" - starts a container with the name "container_name"

        '''
        if len(data.split()) == 1 and data.split()[0] == "Info":
            await ws.send(json.dumps(get_info()))
        else:
            try:
                command = data.split()[-1]
                name = data.split()[0]
                if command == "Run":
                    await ws.send(json.dumps(run_container(name)))
                elif command == "Delete":
                    await ws.send(json.dumps(delete_container(name)))
                elif command == "Stop":
                    await ws.send(json.dumps(stop_container(name)))
                elif command == "Start":
                    await ws.send(json.dumps(start_container(name)))
                else:
                    await ws.send(json("Invalid request : " + command))
            except:
                pass
        print(f"Got the input from the client: {data}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
