@echo off
echo Cleaning PetStore project before GitHub push...
echo.

echo Cleaning Backend Maven projects...
cd be\auth-api
call mvn clean
cd ..\..

cd be\product-api
call mvn clean
cd ..\..

cd be\gateway-api
call mvn clean
cd ..\..

cd be\cart-api
call mvn clean
cd ..\..

echo.
echo Cleaning Frontend...
cd fe
if exist node_modules rmdir /s /q node_modules
if exist .angular rmdir /s /q .angular
if exist dist rmdir /s /q dist
cd ..

echo.
echo Clean completed!
echo.
echo Ready to commit!
pause
