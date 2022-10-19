#!/usr/bin/env bash
#
###############################################################################
#
# Copy a handful of variables from the DeepMIP database as test data for the
# climate archive app. Also duplicates the directory structure of the database.
#
###############################################################################
set -e

scriptDir="/Volumes/externalSSD/wb19586/climate_archive_app/prototype_data"
databaseDir="/Users/wb19586/data_internal/deepmip/deepmip_read_backup_220121/DeepMIP-Eocene/User_Model_Database_v1.0"
netcdfDir="/Volumes/externalSSD/wb19586/climate_archive_app/prototype_data/netcdf/DeepMIP-Eocene"
pngDir="/Volumes/externalSSD/wb19586/climate_archive_app/prototypeParticles/static/modelData/DeepMIP-Eocene"

modelFamilyList="CESM COSMOS GFDL HadCM3 INMCM IPSL MIROC NorESM"
experimentList="piControl deepmip_sens_1xCO2 deepmip_sens_2xCO2 deepmip_stand_3xCO2 deepmip_sens_4xCO2 deepmip_stand_6xCO2 deepmip_sens_9xCO2"
variableList="tas pr"

for modelFamily in ${modelFamilyList}; do

  if [ -d ${netcdfDir}/${modelFamily} ]; then rm -r ${netcdfDir}/${modelFamily}; fi
  if [ -d ${pngDir}/${modelFamily} ]; then rm -r ${pngDir}/${modelFamily}; fi
  cd ${databaseDir}/${modelFamily}
  for model in */ ; do
    modelName=${model%/}
    echo "copying data for model: "${modelName}
    for experiment in ${experimentList}; do 
      if [ -d ${databaseDir}/${modelFamily}/${modelName}/${experiment}/v1.0 ]; then
        mkdir -p ${netcdfDir}/${modelName}/${experiment}/v1.0
        mkdir -p ${pngDir}/${modelName}/${experiment}/v1.0
        for variable in ${variableList}; do      
          if [ -f ${databaseDir}/${modelFamily}/${modelName}/${experiment}/v1.0/*${variable}*.mean.nc ]; then
            databaseFile=$(ls ${databaseDir}/${modelFamily}/${modelName}/${experiment}/v1.0/*${variable}*.mean.nc)
            # copy monthly mean netcdf file for back-end access 
            cp ${databaseFile} ${netcdfDir}/${modelName}/${experiment}/v1.0/
            # use CDO to create temporary netcdf file with correct grid dimensions: lon[-180,180] lat[90,-90]
            tmpNetcdf=${pngDir}/${modelName}/${experiment}/v1.0/${modelFamily}_${modelName}_${experiment}_${variable}_v1.0.tmp.nc
            cdo sellonlatbox,-180,180,90,-90 ${databaseFile} ${tmpNetcdf}
            # create annual mean png file for THREE.js front-end access
            python ${scriptDir}/prototype_netcdf2png.py --inputFile ${tmpNetcdf} --variable ${variable} --modelName ${modelName} --experiment ${experiment} --version v1.0 --outputDir ${pngDir}/${model}${experiment}/v1.0/
            exit_status=$?
            rm -f ${tmpNetcdf}
          fi
        done
      fi  
    done     
  done
done
  