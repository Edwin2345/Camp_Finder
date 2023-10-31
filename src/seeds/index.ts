const cities = require("./cities");
const {descriptors, places} = require("./seedHelpers")
import { Schema, model, connect, disconnect } from 'mongoose';
const Campground = require("../models/campground")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN;


const geoCoder = mbxGeocoding({accessToken: "pk.eyJ1IjoiZWR3aW4tMjM0NSIsImEiOiJjbG9kZTF3dnQwNTI0MmtueTJ6d24wNDRxIn0._BpqCbrsIkSaemzhJFHMmw"})


//MONGO CONNECTION
main().catch( e =>  console.log(e));

async function main(){

  await connect('mongodb://127.0.0.1:27017/campDB')
  console.log("Database Connection OPENED!")

}

function randElement(arr: string[]): string{
   return arr[Math.floor(Math.random()*arr.length)];
}


async function seedDB(){
    //clear all previous entries
    await Campground.deleteMany({});

    for (let i=0; i<25; ++i){
        const randCityNum = Math.floor(Math.random()*18);
        const randPrice = Math.floor(Math.random()*100);
        const camp = new Campground({
            title: `${randElement(descriptors)} ${randElement(places)}`,
            location: `${cities[randCityNum].city}, ${cities[randCityNum].state}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dcacq2o3b/image/upload/v1698608245/CampFinder/scla5zpuspnglwwsiot4.jpg',
                  filename: 'CampFinder/scla5zpuspnglwwsiot4',
                },
                {
                  url: 'https://res.cloudinary.com/dcacq2o3b/image/upload/v1698608245/CampFinder/luhg2is7gwyxocgmzu84.jpg',
                  filename: 'CampFinder/luhg2is7gwyxocgmzu84',

                }
            ],
            author: "653c0943eabd63f0690a60e4",
            price: randPrice,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero quae ab quia. Alias nihil asperiores totam est beatae, sed, vitae eum, commodi quae esse quidem inventore illo. Neque, sapiente eos?"
        })
        //Geolocate City
       const geoResult = await geoCoder.forwardGeocode({
            query: `${cities[randCityNum].city}, ${cities[randCityNum].state}`,
            limit: 1
        }).send();
        if(geoResult){
            camp.geometry = geoResult.body.features[0].geometry;
        }
        await camp.save();
        console.log(camp);
    }
}


seedDB()
.then(() => {disconnect()} )
.catch( (e) => console.log(e))