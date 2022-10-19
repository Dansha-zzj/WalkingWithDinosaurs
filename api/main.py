from flask import jsonify, Flask
import netCDF4
# import numpy as np

# Reading examples: https://nbviewer.jupyter.org/github/Unidata/netcdf4-python/blob/master/examples/reading_netCDF.ipynb
# Reading data from a multi-file netCDF dataset - https://unidata.github.io/netcdf4-python/#reading-data-from-a-multi-file-netcdf-dataset
# Accessing variables: https://unidata.github.io/netcdf4-python/#variables-in-a-netcdf-file

app = Flask(__name__)
SAMPLE_FILE = "/var/src/database/netcdf/DeepMIP-Eocene/CESM1.2_CAM5/deepmip_sens_1xCO2/v1.0/CESM1.2_CAM5-deepmip_sens_1xCO2-pr-v1.0.mean.nc"
dataset = netCDF4.Dataset(SAMPLE_FILE)

@app.route('/')
def welcome():
    return f"Welcome to the Climate Archive API - <br />Let's read {SAMPLE_FILE} <br /><a href='/keys'>keys</a> or <a href='/dimensions'>dimensions</a>."

@app.route('/keys')
def read_sample_file_keys():
    """Return as a JSON response"""
    return jsonify(keys=list(dataset.variables.keys()))

@app.route('/dimensions')
def read_sample_file_dimensions():
    return jsonify(dimensions=list(dataset.dimensions.keys()))

if __name__ == "__main__":
    app.run()