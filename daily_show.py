import os
from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json

app = Flask(__name__)

MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DBS_NAME = os.getenv('MONGO_DB_NAME', 'DailyShow')
COLLECTION_NAME = 'projectstream2'


@app.route('/')
def index():
    """
    A Flask view for the main page
    """
    return render_template("home.html")


@app.route('/graphs')
def about():
   return render_template('graphs.html')


@app.route("/DailyShow/guests_data")
def dailyshow_guests():
    """
    A Flask view to serve the project data from
    MongoDB in JSON format.
    """

    # A constant that defines the record fields that we wish to retrieve.
    FIELDS = {
        '_id': False, 'YEAR': True, 'GoogleKnowlege_Occupation': True,
        'Show': True, 'Group': True,
        'Raw_Guest_List': True,
    }

    # Open a connection to MongoDB using a with statement such that the
    # connection will be closed as soon as we exit the with statement
    with MongoClient(MONGO_URI) as conn:
        collection = conn[DBS_NAME][COLLECTION_NAME]
        # Retrieve a result set only with the fields defined in FIELDS
        # and limit the the results to 55000
        projects = collection.find(projection=FIELDS, limit=55000)
        # Convert projects to a list in a JSON object and return the JSON data
        return json.dumps(list(projects))


if __name__ == "__main__":
    app.run(debug=True)
