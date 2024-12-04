FROM python:3.10

WORKDIR /ML_FastAPI_Docker_Heroku

COPY ./requirements.txt /ML_FastAPI_Docker_Heroku/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /ML_FastAPI_Docker_Heroku/requirements.txt

COPY ./main.py /ML_FastAPI_Docker_Heroku/main.py
COPY ./.env /ML_FastAPI_Docker_Heroku/.env

EXPOSE 80

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-80}"]
