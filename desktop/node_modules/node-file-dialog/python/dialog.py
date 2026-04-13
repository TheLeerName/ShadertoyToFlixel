import tkinter as tk
import tkinter.filedialog
import argparse
import sys
import ast
from typing import Iterable
root = tk.Tk()
# Hide it with .withdraw
root.withdraw()

ext = None
types = None
dir = None
file = None
windowtitle = None
     
parser=argparse.ArgumentParser(
        description="Opens File selection dialog boxes")
parser.add_argument('-d',help="directory open prompt",action='store_true')
parser.add_argument('-o',help='file open prompt',action='store_true')
parser.add_argument('-s',help='file save prompt',action='store_true')
parser.add_argument('-f',help='multiple files open prompt',action='store_true')
parser.add_argument('-ext',  help='default extension')
parser.add_argument('-types',  help='file types')
parser.add_argument('-dir',  help='starting directory')
parser.add_argument('-file',  help='starting file')
parser.add_argument('-title',  help='window title')
args=parser.parse_args()

def returnkwargs(extension, filetypelist, directory, fileinit, titleofwindow):
    kwargs = {}
    if extension is not None and filetypelist is not None and args.d is False:
        kwargs['defaultextension'] = extension
        kwargs['filetypes'] = ast.literal_eval(filetypelist)
    if directory is not None:
        kwargs['initialdir'] = directory
    if fileinit is not None:
        kwargs['initialfile'] = fileinit
    if titleofwindow is not None:
        kwargs['title'] = titleofwindow
    return kwargs

def saveas(extension: str | None, filetypelist: str | None, directory: str | None, fileinit: str | None, titleofwindow: str | None):
    kwargs = returnkwargs(extension=extension, filetypelist=filetypelist, directory=directory, fileinit=fileinit, titleofwindow=titleofwindow)
    return tkinter.filedialog.asksaveasfilename(**kwargs)

def openfile(extension: str | None, filetypelist: str | None, directory: str | None, fileinit: str | None, titleofwindow: str | None):
    kwargs = returnkwargs(extension=extension, filetypelist=filetypelist, directory=directory, fileinit=fileinit, titleofwindow=titleofwindow)
    return tkinter.filedialog.askopenfilename(**kwargs)

def opendir(extension: str | None, filetypelist: str | None, directory: str | None, fileinit: str | None, titleofwindow: str | None):
    kwargs = returnkwargs(extension=extension, filetypelist=filetypelist, directory=directory, fileinit=fileinit, titleofwindow=titleofwindow)
    return tkinter.filedialog.askdirectory(**kwargs)

def openfiles(extension: str | None, filetypelist: str | None, directory: str | None, fileinit: str | None, titleofwindow: str | None):
    kwargs = returnkwargs(extension=extension, filetypelist=filetypelist, directory=directory, fileinit=fileinit, titleofwindow=titleofwindow)
    return tkinter.filedialog.askopenfilenames(**kwargs)

if args.ext:
    ext = args.ext
if args.types:
    types = args.types
if args.dir:
    dir = args.dir
if args.file:
    file = args.file
if args.title:
    windowtitle = args.title
if len(sys.argv)==1:
    parser.print_help(sys.stderr)
    sys.exit(1)
if args.s:
    temp=(saveas(extension=ext, filetypelist=types, directory=dir, fileinit=file, titleofwindow=windowtitle))
    if(len(temp)==0):
        print("None")
    else:
        print(temp)
if args.o:
    temp=(openfile(extension=ext, filetypelist=types, directory=dir, fileinit=file, titleofwindow=windowtitle))
    if(len(temp)==0):
        print("None")
    else:
        print(temp)

if args.d:
    temp=(opendir(extension=ext, filetypelist=types, directory=dir, fileinit=file, titleofwindow=windowtitle))
    if(len(temp)==0):
        print("None")
    else:
        print(temp)

if args.f:
    temp=(openfiles(extension=ext, filetypelist=types, directory=dir, fileinit=file, titleofwindow=windowtitle))
    if(len(temp)==0):
        print("None")
    else:
        print('\n'.join(temp))

# most of my changes can probably be done better but oh well
