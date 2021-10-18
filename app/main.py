import logging

from flask import Flask

app = Flask(__name__)


@app.route('/')
def app():
    """Return a friendly HTTP greeting."""
    return 'I\'m the APP'


@app.errorhandler(500)
def server_error(e):
    logging.exception('An error occurred during a request.')
    return """
    An internal error occurred: <pre>{}</pre>
    See logs for full stacktrace.
    """.format(e), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)