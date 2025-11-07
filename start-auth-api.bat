@echo off
title Auth API - Optimized

echo Starting Auth API with optimized JVM settings...

set JAVA_OPTS=-Xms128m -Xmx256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication

cd be\auth-api
mvn spring-boot:run -Dspring-boot.run.jvmArguments="%JAVA_OPTS%"