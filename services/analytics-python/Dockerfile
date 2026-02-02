FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_VERSION=1.7.1 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv"

# Prepend poetry and venv to path
ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

# Install system dependencies
RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        curl \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Setup work directory
WORKDIR $PYSETUP_PATH
COPY pyproject.toml poetry.lock* ./

# Install project dependencies
RUN poetry install --no-root

# Development stage
FROM base as dev
WORKDIR /app
# Copy venv from base
COPY --from=base $PYSETUP_PATH $PYSETUP_PATH
# Copy application code
COPY . .
# Expose port
EXPOSE 8003
# Command is overridden by docker-compose
CMD ["uvicorn", "src.presentation.main:app", "--host", "0.0.0.0", "--port", "8003", "--reload"]

# Production stage
FROM base as prod
WORKDIR /app
COPY --from=base $PYSETUP_PATH $PYSETUP_PATH
COPY . .
CMD ["uvicorn", "src.presentation.main:app", "--host", "0.0.0.0", "--port", "8003"]
