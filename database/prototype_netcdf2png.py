import sys
import numpy as np
from netCDF4 import Dataset
import argparse
from argparse import RawDescriptionHelpFormatter
from PIL import Image
import codecs, json 

parser = argparse.ArgumentParser(description = """prototype_netcdf2png.py

Read in a single variable 12-month climatology of climate model output and converts them to
PNG files to reduce file sizes for network transfer and for easy loading in THREE.js and 
passing to the GPU.

""", formatter_class = RawDescriptionHelpFormatter)
parser.add_argument('--inputFile', dest = 'inputFile', help = 'Full path of input netCDF file')
parser.add_argument('--variable', dest = 'variable', help = 'Variable name following CMIP convention')
parser.add_argument('--modelName', dest = 'modelName', help = 'Name of climate model from DeepMIP database')
parser.add_argument('--experiment', dest = 'experiment', help = 'Name of experiment from DeepMIP database')
parser.add_argument('--version', dest = 'version', help = 'Version number from DeepMIP database')
parser.add_argument('--outputDir', dest = 'outputDir', help = 'Output directory to store the PNG files')
args = parser.parse_args()

# ***************************************************************************************
# load data and dimensions
# ***************************************************************************************
fInput        = Dataset(args.inputFile)
inputData     = fInput.variables[args.variable][:]
inputDims     = list(fInput.variables[args.variable].dimensions)
inputRank     = len(inputDims)

# check expected dimension names are parsed correctly and load dimension variables
# expected: (level) x (time) x lat x lon with optional dimensions in brackets
latName       = inputDims[inputRank-2]
if (latName == 'lat' or latName == 'latitude'):
  inputLat    = fInput.variables[latName][:]
else:
  print('ERROR: unexpected latitude dimension name. EXITING script!')
  sys.exit(1)

lonName       = inputDims[inputRank-1]
if (lonName == 'lon' or lonName == 'longitude'):
  inputLon    = fInput.variables[lonName][:]
else:
  print('ERROR: unexpected longitude dimension name. EXITING script!')
  sys.exit(1)

if (inputRank > 2):
  timeName      = inputDims[inputRank-3]
  if (timeName == 'month' or timeName == 'time' or timeName == 't' or timeName == 'time_counter'):
    inputTime    = fInput.variables[timeName][:]
  else:
    print('for file: ' + args.inputFile + ':')
    print('ERROR: unexpected time dimension name. EXITING script!')
    sys.exit(1)

# ***************************************************************************************
# check and correct latitudes and longitudes
# ***************************************************************************************

# function to check for strictly increasing latitude and longitude coordinates
def strictly_increasing(L):
    return all(x<y for x, y in zip(L, L[1:]))    

# latitude coordinates should decrease from 90 to -90 for correct orientation of PNG.
# therefore, test with strictly_increasing and reverse latitudes if this is true
if (strictly_increasing(inputLat)): 
  inputLat  = np.flip(inputLat, 0)
  inputData = np.flip(inputData, inputRank-2)

# longitude coordinates should increase and start at -180 -> [-180,180] for cyclic 
# longitude in Pacific. The CDO processing 'sellonlatbox,-180,180,90,-90' should take care
# of this. Nevertheless, test if this did actually work:

if (strictly_increasing(inputLon)): 
  if (np.amax(inputLon) > 180):
    print('for file: ' + args.inputFile + ':')
    print('ERROR: longitudes seem to be outside [-180,180]. EXITING script!')
    sys.exit(1)
else:
    print('for file: ' + args.inputFile + ':')
    print('ERROR: longitudes do not seem to be strictly increasing. EXITING script!')
    sys.exit(1)

# ***************************************************************************************
# calculate annual mean
# ***************************************************************************************
    
if (inputRank > 2):
  inputData_ym  = np.nanmean(inputData, axis=inputRank-3)
  inputData_mm  = np.reshape(inputData, (len(inputLat) * 12, len(inputLon)) )
  print(inputData_mm.shape)

# ***************************************************************************************
# write data to PNG files
# ***************************************************************************************

# function to normalize data to range 0-1

# (X/sc+1.)/2.->X;
# X[X<0]<-0;
# X[X>1]<-1;
# X
 
def norm(arr, norm_min, norm_max):
    arr_min =  norm_min
    arr_max =  norm_max
    return (arr - norm_min) / (norm_max - norm_min)
    
    
#outputData        = np.ones((len(inputLat),len(inputLon),3))
#outputData[:,:,0] = norm(inputData_ym - 273.15, -50, 0) * 255
#outputData[:,:,1] = np.modf(outputData[:,:,0])[0] * 255
#outputData[:,:,1] = norm(inputData_ym - 273.15, 0.1, 50) * 255
#outputData[:,:,2] = norm(inputData_ym - 23.15)
#outputData[:,:,3] = norm(2.3*inputData_ym - 273.15)
#img = Image.fromarray(np.uint8(outputData) , 'RGB')
#img.save(args.outputDir + 'out.png')


outputData_ym        = np.zeros(inputData_ym.shape)
outputData_mm        = np.zeros(inputData_mm.shape)

# map to range [0,254]; reserve 255 for missing values
if (args.variable == 'tas'):
  outputData_ym[:,:]   = norm(inputData_ym - 273.15, -60, 50) * 254
  outputData_mm[:,:]   = norm(inputData_mm - 273.15, -60, 50) * 254
elif (args.variable == 'pr'):
  outputData_ym[:,:]   = norm(inputData_ym * 86400., 0, 25) * 254 
  outputData_mm[:,:]   = norm(inputData_mm * 86400., 0, 25) * 254 

# cap data to chosen dynamic range
outputData_ym[outputData_ym > 254] = 254
outputData_ym[outputData_ym < 0] = 0
outputData_mm[outputData_mm > 254] = 254
outputData_mm[outputData_mm < 0] = 0

img_ym = Image.fromarray(np.uint8(outputData_ym) , 'L')
img_ym.save(args.outputDir  +  args.modelName + '_' + args.experiment + '_' + args.variable + '_' + args.version + '.ym.png')

img_mm = Image.fromarray(np.uint8(outputData_mm) , 'L')
img_mm.save(args.outputDir  +  args.modelName + '_' + args.experiment + '_' + args.variable + '_' + args.version + '.mm.png')