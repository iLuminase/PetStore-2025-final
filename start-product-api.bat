@echo off
title Product API - Optimized

echo Starting Product API with optimized JVM settings...

set JAVA_OPTS=-Xms256m -Xmx512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication -XX:+OptimizeStringConcat

cd be\product-api
mvn spring-boot:run -Dspring-boot.run.jvmArguments="%JAVA_OPTS%"