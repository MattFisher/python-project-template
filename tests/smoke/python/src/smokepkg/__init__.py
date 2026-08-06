"""Typed on purpose: a type checker passing over an empty package would prove nothing."""

from __future__ import annotations


def greet(name: str) -> str:
    return f"hello, {name}"
